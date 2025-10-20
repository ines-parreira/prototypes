import { useMemo } from 'react'

import { Team } from '@gorgias/helpdesk-queries'

import { useListTeamsSearch } from './useListTeamsSearch'

export const NO_TEAM_OPTION = {
    id: 'no_team',
    label: 'No team',
} as const

export type TeamOption = {
    id: number | typeof NO_TEAM_OPTION.id
    label: string
}

type UseTeamOptionsParams = {
    currentTeam?: Team | null
}

export function useTeamOptions({ currentTeam }: UseTeamOptionsParams) {
    const { teams, isLoading, search, setSearch, onLoad, shouldLoadMore } =
        useListTeamsSearch()

    const teamsMap = useMemo(() => {
        return new Map(teams.map((team) => [team.id, team]))
    }, [teams])

    const teamOptions = useMemo<TeamOption[]>(() => {
        const options = teams.map((team) => ({
            id: team.id,
            label: team.name,
        }))

        if (currentTeam && !isLoading && !search) {
            return [NO_TEAM_OPTION, ...options]
        }

        return options
    }, [teams, currentTeam, isLoading, search])

    const selectedOption = useMemo(() => {
        if (!currentTeam) {
            return NO_TEAM_OPTION
        }
        return teamOptions.find((option) => option.id === currentTeam.id)
    }, [currentTeam, teamOptions])

    return {
        teams,
        teamsMap,
        teamOptions,
        selectedOption,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    }
}
