package com.ansarrnd.community.sync.room

import android.content.Context
import androidx.room.Room

fun createCommunityDatabase(context: Context): CommunityDatabase {
    val appContext = context.applicationContext
    val databaseFile = appContext.getDatabasePath(COMMUNITY_DATABASE_NAME)
    val builder = Room.databaseBuilder<CommunityDatabase>(
        context = appContext,
        name = databaseFile.absolutePath,
    )
    return buildCommunityDatabase(builder)
}

private const val COMMUNITY_DATABASE_NAME = "community-connect.db"
