package com.ansarrnd.community.sync

enum class RsvpStatus {
    ATTENDING,
    DECLINED,
}

enum class OutboxStatus {
    PENDING,
    SYNCING,
    FAILED_RETRYABLE,
    FAILED_PERMANENT,
}

data class RsvpOutboxOperation(
    val operationId: String,
    val userId: String,
    val eventId: String,
    val desiredStatus: RsvpStatus,
    val revision: Long,
    val createdAtMillis: Long,
    val updatedAtMillis: Long,
    val attemptCount: Int,
    val nextAttemptAtMillis: Long,
    val leaseExpiresAtMillis: Long?,
    val status: OutboxStatus,
    val lastErrorCode: String?,
)

fun interface OperationIdGenerator {
    fun newId(): String
}

fun interface SyncClock {
    fun nowMillis(): Long
}
