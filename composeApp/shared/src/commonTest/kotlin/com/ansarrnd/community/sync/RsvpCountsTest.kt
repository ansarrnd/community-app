package com.ansarrnd.community.sync

import kotlin.test.Test
import kotlin.test.assertEquals

class RsvpCountsTest {
    @Test
    fun newRsvpIncrementsTotalAndDesiredBucket() {
        assertEquals(
            RsvpCounts(total = 6, attending = 5, declined = 1),
            calculateRsvpCounts(
                current = RsvpCounts(total = 5, attending = 4, declined = 1),
                previousStatus = null,
                desiredStatus = RsvpStatus.ATTENDING,
            ),
        )
    }

    @Test
    fun repeatedDesiredStatusDoesNotChangeCounts() {
        val current = RsvpCounts(total = 5, attending = 4, declined = 1)

        assertEquals(
            current,
            calculateRsvpCounts(current, RsvpStatus.ATTENDING, RsvpStatus.ATTENDING),
        )
    }

    @Test
    fun switchingRsvpMovesOneResponseBetweenBuckets() {
        assertEquals(
            RsvpCounts(total = 5, attending = 3, declined = 2),
            calculateRsvpCounts(
                current = RsvpCounts(total = 5, attending = 4, declined = 1),
                previousStatus = RsvpStatus.ATTENDING,
                desiredStatus = RsvpStatus.DECLINED,
            ),
        )
    }

    @Test
    fun switchingClampsMalformedPreviousBucketAtZero() {
        assertEquals(
            RsvpCounts(total = 2, attending = 1, declined = 0),
            calculateRsvpCounts(
                current = RsvpCounts(total = 2, attending = 0, declined = 0),
                previousStatus = RsvpStatus.DECLINED,
                desiredStatus = RsvpStatus.ATTENDING,
            ),
        )
    }
}
