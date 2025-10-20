import { useMemo, useState } from 'react'

import { ListTeamsOrderBy, Team } from '@gorgias/helpdesk-queries'

import { useInfiniteListTeams } from './useInfiniteListTeams'

export const useListTeamsSearch = () => {
    const [search, setSearch] = useState('')
    const queryResult = useInfiniteListTeams(
        {
            order_by: ListTeamsOrderBy.NameAsc,
        },
        {
            staleTime: 60000 * 5,
            keepPreviousData: true,
        },
    )

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isFetching } =
        queryResult

    const allTeams = useMemo(
        () => data?.pages.flatMap((page) => page.data.data) ?? [],
        [data],
    )

    // the API doesn't support search, so we filter client-side
    const filteredTeams = useMemo(() => {
        const teams = allTeams.filter(
            (
                team,
            ): team is Team & {
                id: NonNullable<Team['id']>
                name: NonNullable<Team['name']>
            } => !!team.id && !!team.name,
        )
        if (!search) return teams
        const searchLower = search.toLowerCase()
        return teams.filter((team) =>
            team.name?.toLowerCase().includes(searchLower),
        )
    }, [allTeams, search])

    return {
        ...queryResult,
        search,
        setSearch,
        onLoad: fetchNextPage,
        teams: filteredTeams,
        isLoading: isFetchingNextPage || isFetching,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
