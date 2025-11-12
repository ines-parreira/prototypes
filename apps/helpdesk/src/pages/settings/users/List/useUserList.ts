import { useCallback, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import {
    ListUsersParams,
    ListUsersResult,
    useListUsers,
} from '@gorgias/helpdesk-queries'
import {
    ListUsersOrderBy,
    ListUsersRelationshipsItem,
    User,
} from '@gorgias/helpdesk-types'

import { UserRole } from 'config/types/user'
import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import { AI_AGENT_CLIENT_ID } from 'state/agents/constants'

export const STALE_TIME_MS = 5 * 60 * 1000 // 5 minutes (in ms)
export const USERS_PER_PAGE = 15

type UseUserListResult = {
    params: ListUsersParams
    isFetching: boolean
    isLoading: boolean
    isError: boolean
    users: User[]
    hasPrevItems: boolean
    hasNextItems: boolean
    fetchPrevItems: () => void
    fetchNextItems: () => void
    setOrderBy: (
        orderBy: UserSortableProperties,
        orderDir: OrderDirection,
    ) => void
    setSearch: (search: string) => void
}

export function useUserList(): UseUserListResult {
    const [params, setParams] = useState<ListUsersParams>({
        order_by: ListUsersOrderBy.NameAsc,
    })

    const { data, isLoading, isFetching, isError } = useListUsers(
        {
            ...params,
            relationships: [ListUsersRelationshipsItem.AvailabilityStatus],
            limit: USERS_PER_PAGE,
            cursor: params.cursor,
        },
        {
            query: {
                staleTime: STALE_TIME_MS,
                keepPreviousData: true,
                select: (data) => {
                    return extractResponse(data)
                },
            },
        },
    )

    const prevCursor = data?.meta?.prev_cursor
    const nextCursor = data?.meta?.next_cursor

    const hasPrevItems = !!prevCursor
    const hasNextItems = !!nextCursor

    const fetchPrevItems = useCallback(() => {
        setParams((prevParams) => ({
            ...prevParams,
            cursor: prevCursor ?? undefined,
        }))
    }, [prevCursor])

    const fetchNextItems = useCallback(() => {
        setParams((prevParams) => ({
            ...prevParams,
            cursor: nextCursor ?? undefined,
        }))
    }, [nextCursor])

    const setOrderBy = useCallback(
        (orderBy: UserSortableProperties, orderDir: OrderDirection) => {
            setParams((prevParams) => ({
                ...prevParams,
                order_by: `${orderBy}:${orderDir}` as ListUsersOrderBy,
                cursor: undefined,
            }))
            logEvent(SegmentEvent.SettingsUsersSort, { orderBy, orderDir })
        },
        [],
    )

    const setSearch = useCallback((search: string) => {
        setParams((prevParams) => ({
            ...prevParams,
            search,
            cursor: undefined,
        }))
        logEvent(SegmentEvent.SettingsUsersSearch)
    }, [])

    return {
        params,
        isFetching,
        isLoading,
        isError,
        users: data?.filteredUsers ?? [],
        hasPrevItems,
        hasNextItems,
        fetchPrevItems,
        fetchNextItems,
        setOrderBy,
        setSearch,
    }
}

function extractResponse(data: ListUsersResult) {
    const users = data?.data?.data
    const meta = data?.data?.meta

    return {
        filteredUsers: filterUsers(users),
        meta,
    }
}

function filterUsers(users: User[]): User[] {
    return users.filter(
        (user) =>
            user.role?.name !== UserRole.Bot ||
            user.client_id === AI_AGENT_CLIENT_ID,
    )
}
