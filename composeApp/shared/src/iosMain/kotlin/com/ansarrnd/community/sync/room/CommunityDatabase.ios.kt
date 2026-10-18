package com.ansarrnd.community.sync.room

import androidx.room.Room
import platform.Foundation.NSApplicationSupportDirectory
import platform.Foundation.NSFileManager
import platform.Foundation.NSUserDomainMask

fun createCommunityDatabase(): CommunityDatabase {
    val applicationSupportDirectory = NSFileManager.defaultManager.URLForDirectory(
        directory = NSApplicationSupportDirectory,
        inDomain = NSUserDomainMask,
        appropriateForURL = null,
        create = true,
        error = null,
    )?.path ?: error("Unable to resolve the app's database directory.")

    val builder = Room.databaseBuilder<CommunityDatabase>(
        name = "$applicationSupportDirectory/$COMMUNITY_DATABASE_NAME",
    )
    return buildCommunityDatabase(builder)
}

private const val COMMUNITY_DATABASE_NAME = "community-connect.db"
