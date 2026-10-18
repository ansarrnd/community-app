package com.ansarrnd.community.sync

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FirebaseFirestoreException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.tasks.await

class FirebaseRsvpSyncGateway(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
) : RsvpSyncGateway {
    override suspend fun setDesiredStatus(
        userId: String,
        eventId: String,
        status: RsvpStatus,
    ): RsvpSyncResult {
        if (auth.currentUser?.uid != userId) {
            return RsvpSyncResult.AuthenticationRequired
        }

        return try {
            firestore.runTransaction { transaction ->
                val eventReference = firestore.collection(EVENTS_COLLECTION).document(eventId)
                val rsvpReference = firestore.collection(RSVPS_COLLECTION).document("${eventId}_$userId")
                val eventSnapshot = transaction.get(eventReference)
                if (!eventSnapshot.exists()) {
                    return@runTransaction RsvpSyncResult.PermanentFailure(EVENT_NOT_FOUND)
                }

                val rsvpSnapshot = transaction.get(rsvpReference)
                val previousStatus = if (rsvpSnapshot.exists()) {
                    val value = rsvpSnapshot.getString(STATUS_FIELD)
                        ?: return@runTransaction RsvpSyncResult.PermanentFailure(INVALID_RSVP_STATUS)
                    RsvpStatus.entries.firstOrNull { it.name == value }
                        ?: return@runTransaction RsvpSyncResult.PermanentFailure(INVALID_RSVP_STATUS)
                } else {
                    null
                }
                val counts = calculateRsvpCounts(
                    current = RsvpCounts(
                        total = eventSnapshot.getLong(TOTAL_COUNT_FIELD) ?: 0,
                        attending = eventSnapshot.getLong(ATTENDING_COUNT_FIELD) ?: 0,
                        declined = eventSnapshot.getLong(DECLINED_COUNT_FIELD) ?: 0,
                    ),
                    previousStatus = previousStatus,
                    desiredStatus = status,
                )

                transaction.update(
                    eventReference,
                    mapOf(
                        TOTAL_COUNT_FIELD to counts.total,
                        ATTENDING_COUNT_FIELD to counts.attending,
                        DECLINED_COUNT_FIELD to counts.declined,
                        UPDATED_AT_FIELD to FieldValue.serverTimestamp(),
                    ),
                )
                transaction.set(
                    rsvpReference,
                    mapOf(
                        EVENT_ID_FIELD to eventId,
                        USER_ID_FIELD to userId,
                        STATUS_FIELD to status.name,
                        TIMESTAMP_FIELD to FieldValue.serverTimestamp(),
                    ),
                )
                RsvpSyncResult.Applied
            }.await()
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (exception: FirebaseFirestoreException) {
            exception.toSyncResult()
        }
    }

    private fun FirebaseFirestoreException.toSyncResult(): RsvpSyncResult =
        when (code) {
            FirebaseFirestoreException.Code.UNAUTHENTICATED -> RsvpSyncResult.AuthenticationRequired
            FirebaseFirestoreException.Code.NOT_FOUND ->
                RsvpSyncResult.PermanentFailure(EVENT_NOT_FOUND)
            FirebaseFirestoreException.Code.PERMISSION_DENIED,
            FirebaseFirestoreException.Code.INVALID_ARGUMENT,
            FirebaseFirestoreException.Code.FAILED_PRECONDITION,
            FirebaseFirestoreException.Code.OUT_OF_RANGE,
            FirebaseFirestoreException.Code.UNIMPLEMENTED ->
                RsvpSyncResult.PermanentFailure(PERMISSION_OR_VALIDATION_FAILURE)
            else -> RsvpSyncResult.RetryableFailure(code.name)
        }

    private companion object {
        const val EVENTS_COLLECTION = "events"
        const val RSVPS_COLLECTION = "rsvps"
        const val TOTAL_COUNT_FIELD = "rsvpCount"
        const val ATTENDING_COUNT_FIELD = "attendingCount"
        const val DECLINED_COUNT_FIELD = "declinedCount"
        const val UPDATED_AT_FIELD = "updatedAt"
        const val EVENT_ID_FIELD = "eventId"
        const val USER_ID_FIELD = "userId"
        const val STATUS_FIELD = "status"
        const val TIMESTAMP_FIELD = "timestamp"
        const val EVENT_NOT_FOUND = "EVENT_NOT_FOUND"
        const val INVALID_RSVP_STATUS = "INVALID_RSVP_STATUS"
        const val PERMISSION_OR_VALIDATION_FAILURE = "PERMISSION_OR_VALIDATION_FAILURE"
    }
}
