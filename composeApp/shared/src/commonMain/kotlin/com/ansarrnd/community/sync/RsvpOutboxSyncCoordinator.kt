package com.ansarrnd.community.sync

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

data class RsvpRetryPolicy(
    val maxAttempts: Int = 8,
    val baseDelayMillis: Long = 30_000,
    val maxDelayMillis: Long = 6 * 60 * 60 * 1000,
    val operationLeaseMillis: Long = 2 * 60 * 1000,
    val authenticationRetryDelayMillis: Long = 5 * 60 * 1000,
    val batchSize: Int = 50,
) {
    init {
        require(maxAttempts > 0)
        require(baseDelayMillis > 0)
        require(maxDelayMillis >= baseDelayMillis)
        require(operationLeaseMillis > 0)
        require(authenticationRetryDelayMillis > 0)
        require(batchSize > 0)
    }

    fun delayForAttempt(attempt: Int, random: Random = Random.Default): Long {
        require(attempt > 0)
        val shift = (attempt - 1).coerceAtMost(30)
        val multiplier = 1L shl shift
        val exponential = if (baseDelayMillis > maxDelayMillis / multiplier) {
            maxDelayMillis
        } else {
            min(baseDelayMillis * multiplier, maxDelayMillis)
        }
        val jittered = exponential * (0.8 + random.nextDouble() * 0.4)
        return jittered.toLong().coerceIn(1, maxDelayMillis)
    }
}

data class RsvpDrainResult(
    val appliedCount: Int,
    val retryableCount: Int,
    val permanentFailureCount: Int,
    val authenticationRequired: Boolean,
    val nextScheduledAtMillis: Long?,
)

class RsvpOutboxSyncCoordinator(
    private val store: RsvpOutboxStore,
    private val gateway: RsvpSyncGateway,
    private val scheduler: RsvpBackgroundScheduler,
    private val operationIds: OperationIdGenerator,
    private val clock: SyncClock,
    private val retryPolicy: RsvpRetryPolicy = RsvpRetryPolicy(),
) {
    private val drainMutex = Mutex()

    suspend fun setDesiredRsvp(
        userId: String,
        eventId: String,
        status: RsvpStatus,
    ): RsvpOutboxOperation {
        require(userId.isNotBlank()) { "User ID is required to queue an RSVP." }
        require(eventId.isNotBlank()) { "Event ID is required to queue an RSVP." }

        val now = clock.nowMillis()
        val operation = store.enqueueLatest(
            userId = userId,
            eventId = eventId,
            desiredStatus = status,
            operationId = operationIds.newId(),
            nowMillis = now,
        )
        scheduler.schedule(userId, 0)
        return operation
    }

    suspend fun drain(userId: String): RsvpDrainResult = drainMutex.withLock {
        require(userId.isNotBlank()) { "User ID is required to drain the RSVP outbox." }

        val now = clock.nowMillis()
        var applied = 0
        var retryable = 0
        var permanent = 0
        var authRequired = false
        val ready = store.readyOperations(userId, now, retryPolicy.batchSize)

        for (operation in ready) {
            val claimed = store.claim(
                operationId = operation.operationId,
                revision = operation.revision,
                nowMillis = now,
                leaseExpiresAtMillis = now + retryPolicy.operationLeaseMillis,
            ) ?: continue

            val syncResult = try {
                gateway.setDesiredStatus(
                    userId = claimed.userId,
                    eventId = claimed.eventId,
                    status = claimed.desiredStatus,
                )
            } catch (cancelled: kotlinx.coroutines.CancellationException) {
                throw cancelled
            } catch (_: Exception) {
                RsvpSyncResult.RetryableFailure(UNEXPECTED_FAILURE_ERROR_CODE)
            }

            when (val result = syncResult) {
                RsvpSyncResult.Applied -> {
                    if (store.markApplied(claimed.operationId, claimed.revision)) {
                        applied += 1
                    }
                }

                is RsvpSyncResult.RetryableFailure -> {
                    if (claimed.attemptCount >= retryPolicy.maxAttempts) {
                        if (store.markPermanent(
                                claimed.operationId,
                                claimed.revision,
                                claimed.attemptCount,
                                now,
                                result.errorCode,
                            )
                        ) {
                            permanent += 1
                        }
                    } else {
                        val nextAttemptAt = now + retryPolicy.delayForAttempt(claimed.attemptCount)
                        if (store.markRetryable(
                                claimed.operationId,
                                claimed.revision,
                                claimed.attemptCount,
                                nextAttemptAt,
                                now,
                                result.errorCode,
                            )
                        ) {
                            retryable += 1
                        }
                    }
                }

                is RsvpSyncResult.PermanentFailure -> {
                    if (store.markPermanent(
                            claimed.operationId,
                            claimed.revision,
                            claimed.attemptCount,
                            now,
                            result.errorCode,
                        )
                    ) {
                        permanent += 1
                    }
                }

                RsvpSyncResult.AuthenticationRequired -> {
                    val nextAttemptAt = now + retryPolicy.authenticationRetryDelayMillis
                    if (store.markRetryable(
                            claimed.operationId,
                            claimed.revision,
                            claimed.attemptCount,
                            nextAttemptAt,
                            now,
                            AUTH_REQUIRED_ERROR_CODE,
                        )
                    ) {
                        retryable += 1
                    }
                    authRequired = true
                    break
                }
            }
        }

        val nextScheduledAt = store.nextScheduledAtMillis(userId)
        if (nextScheduledAt != null) {
            val delayUntilNext = (nextScheduledAt - clock.nowMillis()).coerceAtLeast(0)
            scheduler.schedule(
                userId,
                if (authRequired) max(delayUntilNext, retryPolicy.authenticationRetryDelayMillis)
                else delayUntilNext,
            )
        }

        RsvpDrainResult(
            appliedCount = applied,
            retryableCount = retryable,
            permanentFailureCount = permanent,
            authenticationRequired = authRequired,
            nextScheduledAtMillis = nextScheduledAt,
        )
    }

    private companion object {
        const val AUTH_REQUIRED_ERROR_CODE = "AUTH_REQUIRED"
        const val UNEXPECTED_FAILURE_ERROR_CODE = "UNEXPECTED_FAILURE"
    }
}
