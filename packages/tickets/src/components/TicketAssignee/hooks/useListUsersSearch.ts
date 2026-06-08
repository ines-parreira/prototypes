import { useMemo, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import type { User } from '@gorgias/helpdesk-queries'
import { ListUsersRolesItem } from '@gorgias/helpdesk-types'

import { useInfiniteListUsers } from './useInfiniteListUsers'

export type NonNullableUser = User & {
    id: NonNullable<User['id']>
    name: NonNullable<User['name']>
}

const ASSIGNABLE_USER_ROLES = [
    ListUsersRolesItem.Admin,
    ListUsersRolesItem.Agent,
    ListUsersRolesItem.BasicAgent,
    ListUsersRolesItem.LiteAgent,
    ListUsersRolesItem.ObserverAgent,
]

export function useListUsersSearch() {
    const [search, setSearch] = useState('')

    const queryResult = useInfiniteListUsers(
        {
            search: search || undefined,
            roles: ASSIGNABLE_USER_ROLES,
        },
        {
            staleTime: Duration.minutes(5),
        },
    )

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching } =
        queryResult

    const users = useMemo<Array<User | null | undefined>>(
        () => data?.pages.flatMap((page) => page.data.data) ?? [],
        [data],
    )

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user): user is NonNullableUser => !!user?.id && !!user.name,
        )
    }, [users])

    return {
        ...queryResult,
        users: filteredUsers,
        search,
        setSearch,
        onLoad: fetchNextPage,
        isLoading: isFetchingNextPage || isFetching,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
