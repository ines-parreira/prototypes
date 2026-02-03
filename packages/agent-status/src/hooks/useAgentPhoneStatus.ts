import { DurationInMs } from '@repo/utils'

import { useGetUserPhoneStatus } from '@gorgias/helpdesk-queries'

type UseAgentPhoneStatusParams = {
    userId: number
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
}
/**
 * Hook that fetches the phone status for a given user.
 *
 * @param userId - The user ID to get the phone status for
 * @param staleTime - The stale time for the phone status
 * @param cacheTime - The cache time for the phone status
 * @param enabled - Whether to fetch the phone status
 * @returns The phone status for the given user
 */

export function useAgentPhoneStatus({
    userId,
    staleTime = DurationInMs.OneMinute,
    cacheTime = DurationInMs.OneHour,
    enabled = true,
}: UseAgentPhoneStatusParams) {
    const { data, isLoading, isError, error } = useGetUserPhoneStatus(userId, {
        query: {
            enabled: !!userId && enabled,
            select: (data) => data.data,
            staleTime,
            cacheTime,
        },
    })

    return {
        data,
        isLoading,
        isError,
        error,
    }
}
