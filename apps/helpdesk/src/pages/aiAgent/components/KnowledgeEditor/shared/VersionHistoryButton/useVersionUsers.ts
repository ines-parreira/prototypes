import { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useQueries } from '@tanstack/react-query'

import { getUser } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import type { VersionItem } from './types'

type UserData = {
    data: {
        firstname: string | null
        lastname: string | null
        name: string
    }
}

type UseVersionUsersResult = {
    userNames: Map<number, string>
    isLoading: boolean
}

export function useVersionUsers(
    versions: VersionItem[],
): UseVersionUsersResult {
    const userIds = useMemo(() => {
        const ids = new Set<number>()
        for (const version of versions) {
            if (version.publisher_user_id) {
                ids.add(version.publisher_user_id)
            }
        }
        return Array.from(ids)
    }, [versions])

    const queries = useQueries({
        queries: userIds.map((id) => ({
            queryKey: queryKeys.users.getUser(id),
            queryFn: () => getUser(id),
            staleTime: Duration.minutes(5),
            enabled: id > 0,
        })),
    })

    const isLoading = queries.some((query) => query.isLoading)

    const userNames = useMemo(() => {
        const map = new Map<number, string>()
        userIds.forEach((id, index) => {
            const query = queries[index]
            if (query?.data) {
                const userData = query.data as unknown as UserData
                const name = userData.data?.name
                if (name) {
                    map.set(id, name)
                }
            }
        })
        return map
    }, [userIds, queries])

    return { userNames, isLoading }
}
