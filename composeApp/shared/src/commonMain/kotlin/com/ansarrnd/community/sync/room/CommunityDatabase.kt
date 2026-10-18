package com.ansarrnd.community.sync.room

import androidx.room.ConstructedBy
import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.RoomDatabaseConstructor

@Database(
    entities = [RsvpOutboxEntity::class],
    version = 1,
    exportSchema = true,
)
@ConstructedBy(CommunityDatabaseConstructor::class)
abstract class CommunityDatabase : RoomDatabase() {
    abstract fun rsvpOutboxDao(): RsvpOutboxDao
}

@Suppress("KotlinNoActualForExpect")
expect object CommunityDatabaseConstructor : RoomDatabaseConstructor<CommunityDatabase> {
    override fun initialize(): CommunityDatabase
}
