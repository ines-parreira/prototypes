import { useMemo } from 'react'

import { DurationInMs } from '@repo/utils'

import { useGetUserPhoneStatus } from '@gorgias/helpdesk-queries'

import { CALL_WRAP_UP_STATUS, ON_A_CALL_STATUS } from '../constants'

type UseAgentPhoneStatusParams = {
    userId: number
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
    /**
     * When true, only reads from cache without making network requests.
     * Useful when cache is pre-populated by batch queries.
     */
    cacheOnly?: boolean
}
/**
 * Hook that fetches the phone status for a given user.
 *
 * @param userId - The user ID to get the phone status for
 * @param staleTime - The stale time for the phone status
 * @param cacheTime - The cache time for the phone status
 * @param enabled - Whether to fetch the phone status
 * @param cacheOnly - When true, only reads from cache without making network requests
 * @returns The phone status for the given user
 */

export function useAgentPhoneStatus({
    userId,
    staleTime = DurationInMs.OneMinute,
    cacheTime = DurationInMs.OneHour,
    enabled = true,
    cacheOnly = false,
}: UseAgentPhoneStatusParams) {
    const { data, isLoading, isError, error } = useGetUserPhoneStatus(userId, {
        query: {
            enabled: !!userId && enabled && !cacheOnly,
            select: (data) => data.data,
            staleTime: cacheOnly ? Infinity : staleTime,
            cacheTime,
        },
    })

    const agentPhoneUnavailabilityStatus = useMemo(() => {
        if (!data) return undefined

        const { phone_status } = data

        switch (phone_status) {
            case 'on-call':
                return ON_A_CALL_STATUS
            case 'wrapping-up':
                return CALL_WRAP_UP_STATUS
            // we don't want to show the unavailability status if the agent is off the phone
            default:
                return undefined
        }
    }, [data])

    return {
        data,
        agentPhoneUnavailabilityStatus,
        isLoading,
        isError,
        error,
    }
}
