import { useEffect, useRef } from 'react'

import { DurationInMs } from '@repo/utils'

import { useListUserPhoneStatus } from '@gorgias/helpdesk-queries'

import { useUpdateUserPhoneStatusInCache } from './useUpdateUserPhoneStatusInCache'

type UseListUserPhoneStatusesParams = {
    userIds: number[]
    enabled?: boolean
    refetchInterval?: number
}

/**
 * Hook that batch fetches user phone statuses and populates the cache for individual queries.
 * This improves performance by reducing the number of API calls when displaying multiple
 * user phone statuses (e.g., in a table).
 *
 * Uses dataUpdatedAt tracking to prevent race conditions when userIds change rapidly
 * (e.g., during pagination).
 *
 * @param userIds - Array of user IDs to fetch phone statuses for
 * @param enabled - Whether the query should run (defaults to true if userIds is not empty)
 * @returns Query result with data, loading, and error states
 */
export const useListUserPhoneStatuses = ({
    userIds,
    enabled = true,
    refetchInterval,
}: UseListUserPhoneStatusesParams) => {
    const lastProcessedAtRef = useRef<number>(0)
    const updateUserPhoneStatusInCache = useUpdateUserPhoneStatusInCache()

    const shouldFetch = enabled && userIds.length > 0

    const { data, isLoading, isError, error, dataUpdatedAt } =
        useListUserPhoneStatus(
            { user_id: userIds },
            {
                query: {
                    enabled: shouldFetch,
                    staleTime: DurationInMs.OneMinute,
                    cacheTime: DurationInMs.OneHour,
                    refetchInterval,
                },
            },
        )

    useEffect(() => {
        if (!data?.data?.data || lastProcessedAtRef.current === dataUpdatedAt) {
            return
        }

        lastProcessedAtRef.current = dataUpdatedAt

        data.data.data.forEach((phoneStatus) => {
            updateUserPhoneStatusInCache(phoneStatus)
        })
    }, [data, dataUpdatedAt, updateUserPhoneStatusInCache])

    return {
        data,
        isLoading,
        isError,
        error,
    }
}
