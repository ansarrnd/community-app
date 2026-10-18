package com.ansarrnd.community.sync

import android.content.Context
import com.ansarrnd.community.sync.room.RoomRsvpOutboxStore
import com.ansarrnd.community.sync.room.createCommunityDatabase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.UUID

object RsvpSyncAndroidRuntime {
    private var installed = false

    @Synchronized
    fun install(
        context: Context,
        auth: FirebaseAuth = FirebaseAuth.getInstance(),
        firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    ) {
        if (installed) return

        val database = createCommunityDatabase(context.applicationContext)
        val coordinator = RsvpOutboxSyncCoordinator(
            store = RoomRsvpOutboxStore(database),
            gateway = FirebaseRsvpSyncGateway(auth, firestore),
            scheduler = WorkManagerRsvpBackgroundScheduler(context.applicationContext),
            operationIds = OperationIdGenerator { UUID.randomUUID().toString() },
            clock = SyncClock { System.currentTimeMillis() },
        )
        RsvpSyncRuntime.install { coordinator }
        installed = true
    }
}
