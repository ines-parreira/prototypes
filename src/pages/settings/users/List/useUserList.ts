import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import axios, { CancelToken, CancelTokenSource } from 'axios'

import { listUsers } from '@gorgias/helpdesk-client'
import { ListUsersParams, useListUsers } from '@gorgias/helpdesk-queries'
import {
    ListUsersOrderBy,
    ListUsersRelationshipsItem,
    User,
} from '@gorgias/helpdesk-types'

import { logEvent, SegmentEvent } from 'common/segment'
import { UserRole } from 'config/types/user'
import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import { AI_AGENT_CLIENT_ID } from 'state/agents/constants'

export const STALE_TIME_MS = 5 * 60 * 1000 // 5 minutes (in ms)
export const USERS_PER_PAGE = 15

type UseUserListResult = {
    params: ListUsersParams
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
    const [users, setUsers] = useState<User[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [params, setParams] = useState<ListUsersParams>({
        order_by: ListUsersOrderBy.NameAsc,
    })
    const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null)

    const { data, isLoading, isError } = useListUsers(
        {
            ...params,
            relationships: [ListUsersRelationshipsItem.AvailabilityStatus],
            limit: USERS_PER_PAGE,
            cursor: params.cursor,
        },
        {
            query: { staleTime: STALE_TIME_MS, keepPreviousData: true },
        },
    )

    const validPageUsers = useMemo(
        () => filterUsers(data?.data.data ?? []),
        [data],
    )
    const prevCursor = data?.data.meta.prev_cursor ?? null
    const hasPrevItems = !!prevCursor
    const hasNextItems = !!nextCursor

    const cancelFetchMore = useCallback(() => {
        if (cancelTokenSourceRef.current) {
            cancelTokenSourceRef.current.cancel()
            cancelTokenSourceRef.current = null
        }
    }, [])

    const onValidPageUsers = useCallback(
        (users: User[], cursor: string | null) => {
            cancelFetchMore()
            const source = axios.CancelToken.source()
            cancelTokenSourceRef.current = source

            completeUsers(params, users, cursor, source.token)
                .then((result) => {
                    setNextCursor(result.cursor)
                    setUsers(result.users)
                })
                .catch((error) => {
                    if (axios.isCancel(error)) {
                        return
                    }

                    // In case of error while fetching more, we can still render the page users:
                    // it might contain fewer users than expected, but it's still valid rows to render.
                    setNextCursor(cursor)
                    setUsers(users)
                })
        },
        [params, cancelFetchMore],
    )

    useEffect(() => {
        if (!isLoading && validPageUsers) {
            onValidPageUsers(
                validPageUsers,
                data?.data.meta.next_cursor ?? null,
            )
        }
    }, [
        isLoading,
        validPageUsers,
        data?.data.meta.next_cursor,
        onValidPageUsers,
    ])

    const fetchPrevItems = useCallback(() => {
        setParams({
            ...params,
            cursor: prevCursor ?? undefined,
        })
    }, [prevCursor, params])

    const fetchNextItems = useCallback(() => {
        setParams({
            ...params,
            cursor: nextCursor ?? undefined,
        })
    }, [nextCursor, params])

    const setOrderBy = useCallback(
        (orderBy: UserSortableProperties, orderDir: OrderDirection) => {
            setParams({
                ...params,
                order_by: `${orderBy}:${orderDir}` as ListUsersOrderBy,
                cursor: undefined,
            })
            logEvent(SegmentEvent.SettingsUsersSort, { orderBy, orderDir })
        },
        [params],
    )

    const setSearch = useCallback(
        (search: string) => {
            setParams({
                ...params,
                search,
                cursor: undefined,
            })
            logEvent(SegmentEvent.SettingsUsersSearch)
        },
        [params],
    )

    useEffect(() => {
        return () => {
            cancelFetchMore()
        }
    }, [cancelFetchMore])

    return {
        params,
        isLoading,
        isError,
        users,
        hasPrevItems,
        hasNextItems,
        fetchPrevItems,
        fetchNextItems,
        setOrderBy,
        setSearch,
    }
}

function filterUsers(users: User[]): User[] {
    return users.filter(
        (user) =>
            user.role?.name !== UserRole.Bot ||
            user.client_id === AI_AGENT_CLIENT_ID,
    )
}

function shouldFetchMore(users: User[], cursor: string | null): boolean {
    return users.length < USERS_PER_PAGE && !!cursor
}

type CompleteUsersResult = {
    users: User[]
    cursor: string | null
}

async function completeUsers(
    params: ListUsersParams,
    users: User[],
    cursor: string | null,
    cancelToken?: CancelToken,
): Promise<CompleteUsersResult> {
    while (shouldFetchMore(users, cursor)) {
        const limit = USERS_PER_PAGE - users.length
        const response = await listUsers(
            {
                ...params,
                cursor: cursor ?? undefined,
                limit,
            },
            { cancelToken },
        )
        const json = response.data

        users.push(...filterUsers(json.data))
        cursor = json.meta.next_cursor
    }

    return { users, cursor }
}
