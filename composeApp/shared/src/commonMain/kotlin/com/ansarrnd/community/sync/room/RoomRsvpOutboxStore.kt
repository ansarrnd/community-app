package com.ansarrnd.community.sync.room

import com.ansarrnd.community.sync.RsvpOutboxOperation
import com.ansarrnd.community.sync.RsvpOutboxStore
import com.ansarrnd.community.sync.RsvpStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class RoomRsvpOutboxStore(
    private val database: CommunityDatabase,
) : RsvpOutboxStore {
    private val dao = database.rsvpOutboxDao()

    override suspend fun enqueueLatest(
        userId: String,
        eventId: String,
        desiredStatus: RsvpStatus,
        operationId: String,
        nowMillis: Long,
    ): RsvpOutboxOperation = dao.enqueueLatest(
        userId = userId,
        eventId = eventId,
        desiredStatus = desiredStatus.name,
        newOperationId = operationId,
        nowMillis = nowMillis,
    ).toOperation()

    override suspend fun readyOperations(
        userId: String,
        nowMillis: Long,
        limit: Int,
    ): List<RsvpOutboxOperation> = dao.ready(userId, nowMillis, limit).map { it.toOperation() }

    override suspend fun claim(
        operationId: String,
        revision: Long,
        nowMillis: Long,
        leaseExpiresAtMillis: Long,
    ): RsvpOutboxOperation? = dao.claim(
        operationId = operationId,
        revision = revision,
        nowMillis = nowMillis,
        leaseExpiresAtMillis = leaseExpiresAtMillis,
    )?.toOperation()

    override suspend fun markApplied(operationId: String, revision: Long): Boolean =
        dao.deleteIfCurrent(operationId, revision) == 1

    override suspend fun markRetryable(
        operationId: String,
        revision: Long,
        attemptCount: Int,
        nextAttemptAtMillis: Long,
        updatedAtMillis: Long,
        errorCode: String,
    ): Boolean = dao.retryIfCurrent(
        operationId = operationId,
        revision = revision,
        attemptCount = attemptCount,
        nextAttemptAtMillis = nextAttemptAtMillis,
        updatedAtMillis = updatedAtMillis,
        errorCode = errorCode,
    ) == 1

    override suspend fun markPermanent(
        operationId: String,
        revision: Long,
        attemptCount: Int,
        updatedAtMillis: Long,
        errorCode: String,
    ): Boolean = dao.failIfCurrent(
        operationId = operationId,
        revision = revision,
        attemptCount = attemptCount,
        updatedAtMillis = updatedAtMillis,
        errorCode = errorCode,
    ) == 1

    override suspend fun nextScheduledAtMillis(userId: String): Long? = dao.nextScheduledAtMillis(userId)

    override fun observeUserOperations(userId: String): Flow<List<RsvpOutboxOperation>> =
        dao.observeForUser(userId).map { rows -> rows.map { it.toOperation() } }

    suspend fun operationFor(userId: String, eventId: String): RsvpOutboxOperation? =
        dao.getByUserAndEvent(userId, eventId)?.toOperation()

    override suspend fun discardPermanentFailure(operationId: String, userId: String): Boolean =
        dao.deletePermanentFailure(operationId, userId) == 1
}
