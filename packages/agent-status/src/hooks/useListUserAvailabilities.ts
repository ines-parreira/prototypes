import { useEffect, useRef } from 'react'

import { DurationInMs } from '@repo/utils'

import { useListUserAvailabilities as useListUserAvailabilitiesPrimitive } from '@gorgias/helpdesk-queries'

import { useUpdateUserAvailabilityInCache } from './useUpdateUserAvailabilityInCache'

type UseListUserAvailabilitiesParams = {
    userIds: number[]
    enabled?: boolean
}

/**
 * Hook that batch fetches user availabilities and populates the cache for individual queries.
 * This improves performance by reducing the number of API calls when displaying multiple
 * user availabilities (e.g., in a table).
 *
 * Uses dataUpdatedAt tracking to prevent race conditions when userIds change rapidly
 * (e.g., during pagination).
 *
 * @param userIds - Array of user IDs to fetch availabilities for
 * @param enabled - Whether the query should run (defaults to true if userIds is not empty)
 * @returns Query result with data, loading, and error states
 */
export const useListUserAvailabilities = ({
    userIds,
    enabled = true,
}: UseListUserAvailabilitiesParams) => {
    const lastProcessedAtRef = useRef<number>(0)
    const updateUserAvailabilityInCache = useUpdateUserAvailabilityInCache()

    // Only enable query if we have user IDs and enabled is true
    const shouldFetch = enabled && userIds.length > 0

    const { data, isLoading, isError, error, dataUpdatedAt } =
        useListUserAvailabilitiesPrimitive(
            { user_id: userIds },
            {
                query: {
                    enabled: shouldFetch,
                    staleTime: DurationInMs.FiveMinutes,
                    cacheTime: DurationInMs.FiveMinutes,
                },
            },
        )

    // Populate individual user availability caches from batch response
    useEffect(() => {
        // Early exit: no data or already processed this data
        if (!data?.data?.data || lastProcessedAtRef.current === dataUpdatedAt) {
            return
        }

        // Update the ref to mark this data as processed
        lastProcessedAtRef.current = dataUpdatedAt

        // Populate individual caches
        data.data.data.forEach((availability) => {
            updateUserAvailabilityInCache(availability)
        })
    }, [data, dataUpdatedAt, updateUserAvailabilityInCache])

    return {
        data,
        isLoading,
        isError,
        error,
    }
}
