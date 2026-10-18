package com.ansarrnd.community.sync.room

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.ansarrnd.community.sync.OutboxStatus
import com.ansarrnd.community.sync.RsvpOutboxOperation
import com.ansarrnd.community.sync.RsvpStatus

@Entity(
    tableName = "rsvp_outbox",
    indices = [
        Index(value = ["userId", "eventId"], unique = true),
        Index(value = ["userId", "status", "nextAttemptAtMillis"]),
    ],
)
data class RsvpOutboxEntity(
    @PrimaryKey val operationId: String,
    val userId: String,
    val eventId: String,
    val desiredStatus: String,
    val revision: Long,
    val createdAtMillis: Long,
    val updatedAtMillis: Long,
    val attemptCount: Int,
    val nextAttemptAtMillis: Long,
    val leaseExpiresAtMillis: Long?,
    val status: String,
    val lastErrorCode: String?,
) {
    fun toOperation() = RsvpOutboxOperation(
        operationId = operationId,
        userId = userId,
        eventId = eventId,
        desiredStatus = RsvpStatus.valueOf(desiredStatus),
        revision = revision,
        createdAtMillis = createdAtMillis,
        updatedAtMillis = updatedAtMillis,
        attemptCount = attemptCount,
        nextAttemptAtMillis = nextAttemptAtMillis,
        leaseExpiresAtMillis = leaseExpiresAtMillis,
        status = OutboxStatus.valueOf(status),
        lastErrorCode = lastErrorCode,
    )
}

internal fun RsvpOutboxOperation.toEntity() = RsvpOutboxEntity(
    operationId = operationId,
    userId = userId,
    eventId = eventId,
    desiredStatus = desiredStatus.name,
    revision = revision,
    createdAtMillis = createdAtMillis,
    updatedAtMillis = updatedAtMillis,
    attemptCount = attemptCount,
    nextAttemptAtMillis = nextAttemptAtMillis,
    leaseExpiresAtMillis = leaseExpiresAtMillis,
    status = status.name,
    lastErrorCode = lastErrorCode,
)
