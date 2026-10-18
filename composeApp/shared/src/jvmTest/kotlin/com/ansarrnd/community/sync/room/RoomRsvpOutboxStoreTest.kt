package com.ansarrnd.community.sync.room

import androidx.room.Room
import androidx.sqlite.driver.bundled.BundledSQLiteDriver
import com.ansarrnd.community.sync.OutboxStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RoomRsvpOutboxStoreTest {
    @Test
    fun coalescesByUserAndEventAndPreservesNewerRevision() = runTest {
        val database = newDatabase()
        try {
            val dao = database.rsvpOutboxDao()
            val first = dao.enqueueLatest("user-1", "event-1", "ATTENDING", "op-1", 100)
            val unchanged = dao.enqueueLatest("user-1", "event-1", "ATTENDING", "unused", 200)
            val latest = dao.enqueueLatest("user-1", "event-1", "DECLINED", "unused-2", 300)

            assertEquals(first.operationId, latest.operationId)
            assertEquals(1, unchanged.revision)
            assertEquals(2, latest.revision)

            val claimed = dao.claim(
                operationId = first.operationId,
                revision = first.revision,
                nowMillis = 300,
                leaseExpiresAtMillis = 1_000,
            )
            assertNull(claimed)
            assertEquals(OutboxStatus.PENDING.name, dao.getById(first.operationId)?.status)
            assertEquals(0, dao.deleteIfCurrent(first.operationId, first.revision))
        } finally {
            database.close()
        }
    }

    @Test
    fun claimLeaseCanBeRecoveredAndAcknowledgementIsRevisionScoped() = runTest {
        val database = newDatabase()
        try {
            val dao = database.rsvpOutboxDao()
            val queued = dao.enqueueLatest("user-1", "event-1", "ATTENDING", "op-1", 100)
            val claimed = dao.claim(
                operationId = queued.operationId,
                revision = queued.revision,
                nowMillis = 100,
                leaseExpiresAtMillis = 500,
            )
            assertNotNull(claimed)
            assertEquals(1, claimed.attemptCount)
            assertEquals(OutboxStatus.SYNCING.name, claimed.status)
            assertNull(
                dao.claim(
                    operationId = queued.operationId,
                    revision = queued.revision,
                    nowMillis = 499,
                    leaseExpiresAtMillis = 900,
                ),
            )

            val recovered = dao.claim(
                operationId = queued.operationId,
                revision = queued.revision,
                nowMillis = 500,
                leaseExpiresAtMillis = 900,
            )
            assertNotNull(recovered)
            assertEquals(2, recovered.attemptCount)
            assertTrue(dao.deleteIfCurrent(queued.operationId, queued.revision) == 1)
            assertNull(dao.getById(queued.operationId))
        } finally {
            database.close()
        }
    }

    @Test
    fun operationsAreScopedToUser() = runTest {
        val database = newDatabase()
        try {
            val dao = database.rsvpOutboxDao()
            dao.enqueueLatest("user-1", "event-1", "ATTENDING", "op-1", 100)
            dao.enqueueLatest("user-2", "event-1", "DECLINED", "op-2", 100)

            val userOne = dao.ready("user-1", 100, 10)
            val userTwo = dao.ready("user-2", 100, 10)

            assertEquals(listOf("op-1"), userOne.map { it.operationId })
            assertEquals(listOf("op-2"), userTwo.map { it.operationId })
        } finally {
            database.close()
        }
    }

    private fun newDatabase(): CommunityDatabase =
        Room.inMemoryDatabaseBuilder<CommunityDatabase>()
            .setDriver(BundledSQLiteDriver())
            .setQueryCoroutineContext(Dispatchers.IO)
            .build()
}
