package com.ansarrnd.community.sync.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
abstract class RsvpOutboxDao {
    @Query(
        """
        SELECT * FROM rsvp_outbox
        WHERE userId = :userId
          AND (
            (status IN ('PENDING', 'FAILED_RETRYABLE') AND nextAttemptAtMillis <= :nowMillis)
            OR (status = 'SYNCING' AND leaseExpiresAtMillis <= :nowMillis)
          )
        ORDER BY createdAtMillis
        LIMIT :limit
        """,
    )
    abstract suspend fun ready(userId: String, nowMillis: Long, limit: Int): List<RsvpOutboxEntity>

    @Query("SELECT * FROM rsvp_outbox WHERE operationId = :operationId LIMIT 1")
    abstract suspend fun getById(operationId: String): RsvpOutboxEntity?

    @Query("SELECT * FROM rsvp_outbox WHERE userId = :userId AND eventId = :eventId LIMIT 1")
    abstract suspend fun getByUserAndEvent(userId: String, eventId: String): RsvpOutboxEntity?

    @Query("SELECT * FROM rsvp_outbox WHERE userId = :userId ORDER BY createdAtMillis")
    abstract fun observeForUser(userId: String): Flow<List<RsvpOutboxEntity>>

    @Query(
        "DELETE FROM rsvp_outbox WHERE operationId = :operationId AND userId = :userId AND status = 'FAILED_PERMANENT'",
    )
    abstract suspend fun deletePermanentFailure(operationId: String, userId: String): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    abstract suspend fun upsert(entity: RsvpOutboxEntity)

    @Query(
        """
        UPDATE rsvp_outbox
        SET status = 'SYNCING',
            attemptCount = attemptCount + 1,
            leaseExpiresAtMillis = :leaseExpiresAtMillis,
            updatedAtMillis = :nowMillis,
            lastErrorCode = NULL
        WHERE operationId = :operationId
          AND revision = :revision
          AND (
            (status IN ('PENDING', 'FAILED_RETRYABLE') AND nextAttemptAtMillis <= :nowMillis)
            OR (status = 'SYNCING' AND leaseExpiresAtMillis <= :nowMillis)
          )
        """,
    )
    abstract suspend fun claimIfCurrent(
        operationId: String,
        revision: Long,
        nowMillis: Long,
        leaseExpiresAtMillis: Long,
    ): Int

    @Transaction
    open suspend fun claim(
        operationId: String,
        revision: Long,
        nowMillis: Long,
        leaseExpiresAtMillis: Long,
    ): RsvpOutboxEntity? {
        if (claimIfCurrent(operationId, revision, nowMillis, leaseExpiresAtMillis) != 1) return null
        return getById(operationId)
    }

    @Query(
        "DELETE FROM rsvp_outbox WHERE operationId = :operationId AND revision = :revision AND status = 'SYNCING'",
    )
    abstract suspend fun deleteIfCurrent(operationId: String, revision: Long): Int

    @Query(
        """
        UPDATE rsvp_outbox
        SET status = 'FAILED_RETRYABLE',
            attemptCount = :attemptCount,
            nextAttemptAtMillis = :nextAttemptAtMillis,
            leaseExpiresAtMillis = NULL,
            updatedAtMillis = :updatedAtMillis,
            lastErrorCode = :errorCode
        WHERE operationId = :operationId AND revision = :revision AND status = 'SYNCING'
        """,
    )
    abstract suspend fun retryIfCurrent(
        operationId: String,
        revision: Long,
        attemptCount: Int,
        nextAttemptAtMillis: Long,
        updatedAtMillis: Long,
        errorCode: String,
    ): Int

    @Query(
        """
        UPDATE rsvp_outbox
        SET status = 'FAILED_PERMANENT',
            attemptCount = :attemptCount,
            leaseExpiresAtMillis = NULL,
            updatedAtMillis = :updatedAtMillis,
            lastErrorCode = :errorCode
        WHERE operationId = :operationId AND revision = :revision AND status = 'SYNCING'
        """,
    )
    abstract suspend fun failIfCurrent(
        operationId: String,
        revision: Long,
        attemptCount: Int,
        updatedAtMillis: Long,
        errorCode: String,
    ): Int

    @Query(
        """
        SELECT MIN(
          CASE WHEN status = 'SYNCING' THEN leaseExpiresAtMillis
               ELSE nextAttemptAtMillis
          END
        )
        FROM rsvp_outbox
        WHERE userId = :userId AND status IN ('PENDING', 'SYNCING', 'FAILED_RETRYABLE')
        """,
    )
    abstract suspend fun nextScheduledAtMillis(userId: String): Long?

    @Transaction
    open suspend fun enqueueLatest(
        userId: String,
        eventId: String,
        desiredStatus: String,
        newOperationId: String,
        nowMillis: Long,
    ): RsvpOutboxEntity {
        val current = getByUserAndEvent(userId, eventId)
        if (current != null &&
            current.desiredStatus == desiredStatus &&
            current.status != "FAILED_PERMANENT"
        ) {
            return current
        }

        val replacement = RsvpOutboxEntity(
            operationId = current?.operationId ?: newOperationId,
            userId = userId,
            eventId = eventId,
            desiredStatus = desiredStatus,
            revision = (current?.revision ?: 0) + 1,
            createdAtMillis = current?.createdAtMillis ?: nowMillis,
            updatedAtMillis = nowMillis,
            attemptCount = 0,
            nextAttemptAtMillis = nowMillis,
            leaseExpiresAtMillis = null,
            status = "PENDING",
            lastErrorCode = null,
        )
        upsert(replacement)
        return replacement
    }
}
