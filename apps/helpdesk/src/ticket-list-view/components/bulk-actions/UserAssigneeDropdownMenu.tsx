import { KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'

import { Button } from '@gorgias/axiom'

import { Body, Context, focusOnNextItem, Item } from 'components/Dropdown'
import { User } from 'config/types/user'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import useSearch from 'search/useSearch'
import useListUsers from 'users/useListUsers'

import UserDropdownItem from './UserDropdownItem'

import css from './style.less'

type Props = {
    onClick: (item: Item | null) => void
}

const LIMIT_ITEMS_SEARCH = 30
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

const UserAssigneeDropdownMenu = ({ onClick }: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    useDebouncedEffect(
        () => {
            setDebouncedSearch(search)
        },
        [search],
        300,
    )

    const usersResponse = useListUsers(
        {
            limit: LIMIT_ITEMS_SEARCH,
        },
        {
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME,
            enabled: !debouncedSearch,
        },
    )

    const loadMore = useCallback(() => {
        if (usersResponse.hasNextPage && !search) {
            void usersResponse.fetchNextPage()
        }
    }, [search, usersResponse])

    const aggregatedUsersData = useMemo(
        () =>
            usersResponse.data?.pages?.reduce(
                (acc, page) => [...acc, ...page.data.data],
                [] as User[],
            ),
        [usersResponse.data?.pages],
    )

    const searchResponse = useSearch(
        {
            query: debouncedSearch,
            size: LIMIT_ITEMS_SEARCH,
            type: 'agent',
        },
        {
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME,
            enabled: !!debouncedSearch,
        },
    )

    const data: Pick<User, 'id' | 'name' | 'email'>[] | User[] = useMemo(
        () =>
            search
                ? ((searchResponse.data?.data.data as Pick<
                      User,
                      'id' | 'name' | 'email'
                  >[]) ?? [])
                : (aggregatedUsersData ?? []),
        [search, searchResponse, aggregatedUsersData],
    )

    const isLoading = useMemo(
        () =>
            debouncedSearch !== search ||
            usersResponse.isFetching ||
            searchResponse.isFetching,
        [debouncedSearch, search, searchResponse, usersResponse],
    )

    const handleOnClick = useCallback(
        (item: Item | null) => {
            onClick(item)
            setSearch('')
            setDebouncedSearch('')
        },
        [onClick],
    )

    const contextValue = useMemo(
        () => ({
            data,
            debouncedSearch,
            shouldRender:
                !usersResponse.isInitialLoading && (!search || !isLoading),
            isLoading,
            onClick: handleOnClick,
            loadMore,
            search,
            setSearch,
            wrapperRef,
        }),
        [
            data,
            debouncedSearch,
            handleOnClick,
            isLoading,
            loadMore,
            search,
            setSearch,
            usersResponse.isInitialLoading,
            wrapperRef,
        ],
    )

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleOnClick(null)
        } else {
            focusOnNextItem(e, wrapperRef)
        }
    }

    return (
        <Context.Provider value={contextValue}>
            <div className={css.dropdownMenu} ref={wrapperRef}>
                <Body
                    onRenderItem={(item) => <UserDropdownItem item={item} />}
                />
                <DropdownFooter
                    onClick={() => handleOnClick(null)}
                    role="listitem"
                    onKeyDown={onKeyDown}
                    tabIndex={0}
                >
                    <Button fillStyle="ghost">Clear assignee</Button>
                </DropdownFooter>
            </div>
        </Context.Provider>
    )
}

export default UserAssigneeDropdownMenu
