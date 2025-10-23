import { useMemo, useState } from 'react'

import { User } from '@gorgias/helpdesk-queries'

import { useInfiniteListUsers } from './useInfiniteListUsers'

export type NonNullableUser = User & {
    id: NonNullable<User['id']>
    name: NonNullable<User['name']>
}

export function useListUsersSearch() {
    const [search, setSearch] = useState('')

    const queryResult = useInfiniteListUsers(
        {
            search: search || undefined,
        },
        {
            staleTime: 60000 * 5,
        },
    )

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching } =
        queryResult

    const users = useMemo(
        () => data?.pages.flatMap((page) => page.data.data) ?? [],
        [data],
    )

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user): user is NonNullableUser => !!user.id && !!user.name,
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
