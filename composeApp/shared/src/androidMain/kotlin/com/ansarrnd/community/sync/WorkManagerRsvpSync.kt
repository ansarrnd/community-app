package com.ansarrnd.community.sync

import android.content.Context
import android.util.Log
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import kotlinx.coroutines.CancellationException
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

private const val RSVP_SYNC_WORK_PREFIX = "community-rsvp-outbox-"

class WorkManagerRsvpBackgroundScheduler(context: Context) : RsvpBackgroundScheduler {
    private val workManager = WorkManager.getInstance(context.applicationContext)

    override fun schedule(userId: String, delayMillis: Long) {
        require(userId.isNotBlank()) { "User ID is required to schedule RSVP synchronization." }

        val request = OneTimeWorkRequestBuilder<RsvpOutboxWorker>()
            .setInputData(workDataOf(RsvpOutboxWorker.USER_ID_KEY to userId))
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build(),
            )
            .setInitialDelay(delayMillis.coerceAtLeast(0), TimeUnit.MILLISECONDS)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()

        workManager.enqueueUniqueWork(
            workNameFor(userId),
            ExistingWorkPolicy.REPLACE,
            request,
        )
    }

    private fun workNameFor(userId: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
            .digest(userId.toByteArray(Charsets.UTF_8))
            .joinToString(separator = "") { byte ->
                (byte.toInt() and 0xff).toString(16).padStart(2, '0')
            }
        return "$RSVP_SYNC_WORK_PREFIX$digest"
    }
}

fun interface RsvpSyncCoordinatorProvider {
    fun coordinator(): RsvpOutboxSyncCoordinator
}

object RsvpSyncRuntime {
    @Volatile
    private var provider: RsvpSyncCoordinatorProvider? = null

    fun install(coordinatorProvider: RsvpSyncCoordinatorProvider) {
        provider = coordinatorProvider
    }

    internal fun coordinatorOrNull(): RsvpOutboxSyncCoordinator? = provider?.coordinator()
}

class RsvpOutboxWorker(
    appContext: Context,
    parameters: WorkerParameters,
) : CoroutineWorker(appContext, parameters) {
    override suspend fun doWork(): Result {
        val userId = inputData.getString(USER_ID_KEY)
            ?: return Result.failure()
        val coordinator = RsvpSyncRuntime.coordinatorOrNull()
        if (coordinator == null) {
            Log.e(TAG, "RSVP sync runtime was not installed before worker execution.")
            return Result.failure()
        }

        return try {
            coordinator.drain(userId)
            Result.success()
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (exception: Exception) {
            Log.e(TAG, "RSVP outbox synchronization failed.", exception)
            Result.retry()
        }
    }

    internal companion object {
        const val USER_ID_KEY = "user_id"
        private const val TAG = "RsvpOutboxWorker"
    }
}
