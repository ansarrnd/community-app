package com.ansarrnd.community.sync

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class RsvpOutboxSyncCoordinatorTest {
    @Test
    fun successiveIntentsCoalesceToTheLatestRevision() = runTest {
        val fixture = Fixture()

        val first = fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.ATTENDING)
        val latest = fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.DECLINED)

        assertEquals(first.operationId, latest.operationId)
        assertEquals(2, latest.revision)
        assertEquals(RsvpStatus.DECLINED, latest.desiredStatus)
        assertEquals(1, fixture.store.allOperations().size)
    }

    @Test
    fun successfulDrainRemovesOnlyTheAppliedOperation() = runTest {
        val fixture = Fixture(gatewayResult = RsvpSyncResult.Applied)
        fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.ATTENDING)

        val result = fixture.coordinator.drain("user-1")

        assertEquals(1, result.appliedCount)
        assertTrue(fixture.store.allOperations().isEmpty())
    }

    @Test
    fun responseForOlderRevisionCannotDeleteNewerIntent() = runTest {
        val fixture = Fixture(
            gatewayResult = RsvpSyncResult.Applied,
            beforeGatewayResult = { store ->
                store.enqueueLatest(
                    userId = "user-1",
                    eventId = "event-1",
                    desiredStatus = RsvpStatus.DECLINED,
                    operationId = "unused-id",
                    nowMillis = 1_001,
                )
            },
        )
        fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.ATTENDING)

        val result = fixture.coordinator.drain("user-1")
        val pending = fixture.store.allOperations().single()

        assertEquals(0, result.appliedCount)
        assertEquals(2, pending.revision)
        assertEquals(RsvpStatus.DECLINED, pending.desiredStatus)
        assertEquals(OutboxStatus.PENDING, pending.status)
    }

    @Test
    fun retryableFailureRetainsOperationAndSchedulesRetry() = runTest {
        val fixture = Fixture(gatewayResult = RsvpSyncResult.RetryableFailure("NETWORK"))
        fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.ATTENDING)

        val result = fixture.coordinator.drain("user-1")
        val pending = fixture.store.allOperations().single()

        assertEquals(1, result.retryableCount)
        assertEquals(OutboxStatus.FAILED_RETRYABLE, pending.status)
        assertEquals("NETWORK", pending.lastErrorCode)
        assertTrue(pending.nextAttemptAtMillis > fixture.clock.nowMillis())
        assertTrue(fixture.scheduler.delays.last() > 0)
    }

    @Test
    fun authenticationFailureStopsBatchAndDelaysFurtherWork() = runTest {
        val fixture = Fixture(gatewayResult = RsvpSyncResult.AuthenticationRequired)
        fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.ATTENDING)
        fixture.coordinator.setDesiredRsvp("user-1", "event-2", RsvpStatus.ATTENDING)

        val result = fixture.coordinator.drain("user-1")

        assertTrue(result.authenticationRequired)
        assertEquals(1, fixture.gatewayCalls)
        assertTrue(fixture.scheduler.delays.last() >= 5 * 60 * 1000)
    }

    @Test
    fun retryLimitRetainsPermanentFailureForExplicitRecovery() = runTest {
        val fixture = Fixture(
            gatewayResult = RsvpSyncResult.RetryableFailure("UNAVAILABLE"),
            retryPolicy = RsvpRetryPolicy(maxAttempts = 1),
        )
        fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.ATTENDING)

        val result = fixture.coordinator.drain("user-1")
        val failed = fixture.store.allOperations().single()

        assertEquals(1, result.permanentFailureCount)
        assertEquals(OutboxStatus.FAILED_PERMANENT, failed.status)
    }

    @Test
    fun thrownGatewayFailureUsesBoundedRetryPolicy() = runTest {
        val fixture = Fixture(
            gatewayFailure = IllegalStateException("transport failure"),
            retryPolicy = RsvpRetryPolicy(maxAttempts = 1),
        )
        fixture.coordinator.setDesiredRsvp("user-1", "event-1", RsvpStatus.ATTENDING)

        val result = fixture.coordinator.drain("user-1")
        val failed = fixture.store.allOperations().single()

        assertEquals(1, result.permanentFailureCount)
        assertEquals(OutboxStatus.FAILED_PERMANENT, failed.status)
        assertEquals("UNEXPECTED_FAILURE", failed.lastErrorCode)
    }

    private class Fixture(
        private val gatewayResult: RsvpSyncResult = RsvpSyncResult.Applied,
        private val beforeGatewayResult: suspend (FakeRsvpOutboxStore) -> Unit = {},
        private val gatewayFailure: Exception? = null,
        retryPolicy: RsvpRetryPolicy = RsvpRetryPolicy(),
    ) {
        val clock = FakeClock(1_000)
        val store = FakeRsvpOutboxStore()
        val scheduler = RecordingScheduler()
        var gatewayCalls = 0
            private set

        val coordinator = RsvpOutboxSyncCoordinator(
            store = store,
            gateway = object : RsvpSyncGateway {
                override suspend fun setDesiredStatus(
                    userId: String,
                    eventId: String,
                    status: RsvpStatus,
                ): RsvpSyncResult {
                    gatewayCalls += 1
                    beforeGatewayResult(store)
                    gatewayFailure?.let { throw it }
                    return gatewayResult
                }
            },
            scheduler = scheduler,
            operationIds = OperationIdGenerator { "operation-${store.allOperations().size + 1}" },
            clock = clock,
            retryPolicy = retryPolicy,
        )
    }

    private class FakeClock(private val timeMillis: Long) : SyncClock {
        override fun nowMillis(): Long = timeMillis
    }

    private class RecordingScheduler : RsvpBackgroundScheduler {
        val delays = mutableListOf<Long>()

        override fun schedule(userId: String, delayMillis: Long) {
            delays += delayMillis
        }
    }

    private class FakeRsvpOutboxStore : RsvpOutboxStore {
        private val operations = linkedMapOf<String, RsvpOutboxOperation>()
        private val state = MutableStateFlow<List<RsvpOutboxOperation>>(emptyList())

        fun allOperations(): List<RsvpOutboxOperation> = operations.values.toList()

        override suspend fun enqueueLatest(
            userId: String,
            eventId: String,
            desiredStatus: RsvpStatus,
            operationId: String,
            nowMillis: Long,
        ): RsvpOutboxOperation {
            val current = operations.values.firstOrNull { it.userId == userId && it.eventId == eventId }
            if (current != null &&
                current.desiredStatus == desiredStatus &&
                current.status != OutboxStatus.FAILED_PERMANENT
            ) {
                return current
            }

            val replacement = RsvpOutboxOperation(
                operationId = current?.operationId ?: operationId,
                userId = userId,
                eventId = eventId,
                desiredStatus = desiredStatus,
                revision = (current?.revision ?: 0) + 1,
                createdAtMillis = current?.createdAtMillis ?: nowMillis,
                updatedAtMillis = nowMillis,
                attemptCount = 0,
                nextAttemptAtMillis = nowMillis,
                leaseExpiresAtMillis = null,
                status = OutboxStatus.PENDING,
                lastErrorCode = null,
            )
            operations[replacement.operationId] = replacement
            emit()
            return replacement
        }

        override suspend fun readyOperations(
            userId: String,
            nowMillis: Long,
            limit: Int,
        ): List<RsvpOutboxOperation> = operations.values
            .filter { operation ->
                operation.userId == userId && when (operation.status) {
                    OutboxStatus.PENDING, OutboxStatus.FAILED_RETRYABLE ->
                        operation.nextAttemptAtMillis <= nowMillis
                    OutboxStatus.SYNCING -> (operation.leaseExpiresAtMillis ?: Long.MAX_VALUE) <= nowMillis
                    OutboxStatus.FAILED_PERMANENT -> false
                }
            }
            .sortedBy { it.createdAtMillis }
            .take(limit)

        override suspend fun claim(
            operationId: String,
            revision: Long,
            nowMillis: Long,
            leaseExpiresAtMillis: Long,
        ): RsvpOutboxOperation? {
            val current = operations[operationId] ?: return null
            if (current.revision != revision) return null
            val isReady = when (current.status) {
                OutboxStatus.PENDING, OutboxStatus.FAILED_RETRYABLE ->
                    current.nextAttemptAtMillis <= nowMillis
                OutboxStatus.SYNCING -> (current.leaseExpiresAtMillis ?: Long.MAX_VALUE) <= nowMillis
                OutboxStatus.FAILED_PERMANENT -> false
            }
            if (!isReady) return null
            val claimed = current.copy(
                status = OutboxStatus.SYNCING,
                attemptCount = current.attemptCount + 1,
                updatedAtMillis = nowMillis,
                leaseExpiresAtMillis = leaseExpiresAtMillis,
            )
            operations[operationId] = claimed
            emit()
            return claimed
        }

        override suspend fun markApplied(operationId: String, revision: Long): Boolean {
            val current = operations[operationId] ?: return false
            if (current.revision != revision || current.status != OutboxStatus.SYNCING) return false
            operations.remove(operationId)
            emit()
            return true
        }

        override suspend fun markRetryable(
            operationId: String,
            revision: Long,
            attemptCount: Int,
            nextAttemptAtMillis: Long,
            updatedAtMillis: Long,
            errorCode: String,
        ): Boolean = updateCurrent(operationId, revision) {
            it.copy(
                status = OutboxStatus.FAILED_RETRYABLE,
                attemptCount = attemptCount,
                nextAttemptAtMillis = nextAttemptAtMillis,
                updatedAtMillis = updatedAtMillis,
                leaseExpiresAtMillis = null,
                lastErrorCode = errorCode,
            )
        }

        override suspend fun markPermanent(
            operationId: String,
            revision: Long,
            attemptCount: Int,
            updatedAtMillis: Long,
            errorCode: String,
        ): Boolean = updateCurrent(operationId, revision) {
            it.copy(
                status = OutboxStatus.FAILED_PERMANENT,
                attemptCount = attemptCount,
                updatedAtMillis = updatedAtMillis,
                leaseExpiresAtMillis = null,
                lastErrorCode = errorCode,
            )
        }

        override suspend fun nextScheduledAtMillis(userId: String): Long? = operations.values
            .filter {
                it.userId == userId && it.status in setOf(
                    OutboxStatus.PENDING,
                    OutboxStatus.SYNCING,
                    OutboxStatus.FAILED_RETRYABLE,
                )
            }
            .minOfOrNull {
                if (it.status == OutboxStatus.SYNCING) {
                    it.leaseExpiresAtMillis ?: Long.MAX_VALUE
                } else {
                    it.nextAttemptAtMillis
                }
            }

        override fun observeUserOperations(userId: String): Flow<List<RsvpOutboxOperation>> =
            state.map { all -> all.filter { it.userId == userId } }

        override suspend fun discardPermanentFailure(operationId: String, userId: String): Boolean {
            val current = operations[operationId] ?: return false
            if (current.userId != userId || current.status != OutboxStatus.FAILED_PERMANENT) return false
            operations.remove(operationId)
            emit()
            return true
        }

        private fun updateCurrent(
            operationId: String,
            revision: Long,
            update: (RsvpOutboxOperation) -> RsvpOutboxOperation,
        ): Boolean {
            val current = operations[operationId] ?: return false
            if (current.revision != revision || current.status != OutboxStatus.SYNCING) return false
            operations[operationId] = update(current)
            emit()
            return true
        }

        private fun emit() {
            state.value = allOperations()
        }
    }
}
