package com.ansarrnd.community.sync

import kotlinx.coroutines.flow.Flow

interface RsvpOutboxStore {
    suspend fun enqueueLatest(
        userId: String,
        eventId: String,
        desiredStatus: RsvpStatus,
        operationId: String,
        nowMillis: Long,
    ): RsvpOutboxOperation

    suspend fun readyOperations(
        userId: String,
        nowMillis: Long,
        limit: Int,
    ): List<RsvpOutboxOperation>

    suspend fun claim(
        operationId: String,
        revision: Long,
        nowMillis: Long,
        leaseExpiresAtMillis: Long,
    ): RsvpOutboxOperation?

    suspend fun markApplied(operationId: String, revision: Long): Boolean

    suspend fun markRetryable(
        operationId: String,
        revision: Long,
        attemptCount: Int,
        nextAttemptAtMillis: Long,
        updatedAtMillis: Long,
        errorCode: String,
    ): Boolean

    suspend fun markPermanent(
        operationId: String,
        revision: Long,
        attemptCount: Int,
        updatedAtMillis: Long,
        errorCode: String,
    ): Boolean

    suspend fun nextScheduledAtMillis(userId: String): Long?

    fun observeUserOperations(userId: String): Flow<List<RsvpOutboxOperation>>

    suspend fun discardPermanentFailure(operationId: String, userId: String): Boolean
}

interface RsvpSyncGateway {
    suspend fun setDesiredStatus(
        userId: String,
        eventId: String,
        status: RsvpStatus,
    ): RsvpSyncResult
}

sealed interface RsvpSyncResult {
    data object Applied : RsvpSyncResult
    data class RetryableFailure(val errorCode: String) : RsvpSyncResult
    data class PermanentFailure(val errorCode: String) : RsvpSyncResult
    data object AuthenticationRequired : RsvpSyncResult
}

fun interface RsvpBackgroundScheduler {
    fun schedule(userId: String, delayMillis: Long)
}

data class RsvpCounts(
    val total: Long,
    val attending: Long,
    val declined: Long,
)

fun calculateRsvpCounts(
    current: RsvpCounts,
    previousStatus: RsvpStatus?,
    desiredStatus: RsvpStatus,
): RsvpCounts {
    if (previousStatus == desiredStatus) return current

    return when (desiredStatus) {
        RsvpStatus.ATTENDING -> current.copy(
            total = if (previousStatus == null) current.total + 1 else current.total,
            attending = current.attending + 1,
            declined = if (previousStatus == RsvpStatus.DECLINED) (current.declined - 1).coerceAtLeast(0) else current.declined,
        )
        RsvpStatus.DECLINED -> current.copy(
            total = if (previousStatus == null) current.total + 1 else current.total,
            attending = if (previousStatus == RsvpStatus.ATTENDING) (current.attending - 1).coerceAtLeast(0) else current.attending,
            declined = current.declined + 1,
        )
    }
}
