import { KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react'

import { ListTeamsOrderBy } from '@gorgias/helpdesk-queries'

import { Body, Context, focusOnNextItem, Item } from 'components/Dropdown'
import useDebouncedEffect from 'hooks/useDebouncedEffect'
import { Team } from 'models/team/types'
import Button from 'pages/common/components/button/Button'
import DropdownFooter from 'pages/common/components/dropdown/DropdownFooter'
import useSearch from 'search/useSearch'
import { useListTeams } from 'teams/queries'

import TeamDropdownItem from './TeamDropdownItem'

import css from './style.less'

type Props = {
    onClick: (item: Item | null) => void
}

const LIMIT_ITEMS_SEARCH = 30
const STALE_TIME = 5 * 60 * 1000 // 5 minutes

const TeamAssigneeDropdownMenu = ({ onClick }: Props) => {
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

    const teamsResponse = useListTeams(
        {
            limit: LIMIT_ITEMS_SEARCH,
            orderBy: ListTeamsOrderBy.NameAsc,
        },
        {
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME,
            enabled: !debouncedSearch,
        },
    )

    const loadMore = useCallback(() => {
        if (teamsResponse.hasNextPage && !search) {
            void teamsResponse.fetchNextPage()
        }
    }, [search, teamsResponse])

    const aggregatedTeamsData = useMemo(
        () =>
            teamsResponse.data?.pages?.reduce((acc, page) => {
                return [...acc, ...page.data.data]
            }, [] as Team[]),
        [teamsResponse.data?.pages],
    )

    const searchResponse = useSearch(
        {
            query: debouncedSearch,
            size: LIMIT_ITEMS_SEARCH,
            type: 'team',
        },
        {
            refetchOnWindowFocus: false,
            staleTime: STALE_TIME,
            enabled: !!debouncedSearch,
        },
    )

    const data = useMemo(
        () =>
            search
                ? ((searchResponse.data?.data.data as Pick<
                      Team,
                      'id' | 'name'
                  >[]) ?? [])
                : (aggregatedTeamsData ?? []),
        [search, searchResponse, aggregatedTeamsData],
    )

    const isLoading = useMemo(
        () =>
            debouncedSearch !== search ||
            teamsResponse.isFetching ||
            searchResponse.isFetching,
        [debouncedSearch, search, searchResponse, teamsResponse],
    )

    const handleOnClick = useCallback(
        (item: Item | null) => {
            onClick(item)
            setSearch('')
            setDebouncedSearch('')
        },
        [onClick],
    )

    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleOnClick(null)
        } else {
            focusOnNextItem(e, wrapperRef)
        }
    }

    const contextValue = useMemo(
        () => ({
            data,
            debouncedSearch,
            isLoading,
            loadMore,
            onClick: handleOnClick,
            shouldRender:
                !teamsResponse.isInitialLoading &&
                (!search || !isLoading) &&
                debouncedSearch === search,
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
            teamsResponse.isInitialLoading,
        ],
    )

    return (
        <Context.Provider value={contextValue}>
            <div className={css.dropdownMenu} ref={wrapperRef}>
                <Body
                    onRenderItem={(item) => <TeamDropdownItem item={item} />}
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

export default TeamAssigneeDropdownMenu
