import { useMemo } from 'react'

import { TicketTeam } from '@gorgias/helpdesk-queries'

import { useListTeamsSearch } from './useListTeamsSearch'

const SECTION_DETAILS = {
    TEAMS: {
        id: 'teams',
        name: '',
    },
    NO_TEAM: {
        id: 'no_team_section',
        name: '',
    },
}

export const NO_TEAM_OPTION = {
    id: 'no_team',
    label: 'No team',
} as const

export type TeamOption =
    | {
          id: number
          label: string
      }
    | typeof NO_TEAM_OPTION

export type TeamSection = {
    id: string
    name: string
    items: TeamOption[]
}

type UseTeamOptionsParams = {
    currentTeam?: TicketTeam | null
}

export function useTeamOptions({ currentTeam }: UseTeamOptionsParams) {
    const { teams, isLoading, search, setSearch, onLoad, shouldLoadMore } =
        useListTeamsSearch()

    const teamsMap = useMemo(() => {
        return new Map(teams.map((team) => [team.id, team]))
    }, [teams])

    const teamSections = useMemo<TeamSection[]>(() => {
        const sections: TeamSection[] = []

        if (teams.length > 0) {
            let isCurrentTeamLoaded = false
            const items = teams.map((team) => {
                if (team.id === currentTeam?.id) {
                    isCurrentTeamLoaded = true
                }
                return {
                    id: team.id,
                    label: team.name,
                }
            })

            if (currentTeam && !isCurrentTeamLoaded) {
                items.push({
                    id: currentTeam.id,
                    label: currentTeam.name,
                })
            }

            sections.push({
                ...SECTION_DETAILS.TEAMS,
                items,
            })
        }

        if (currentTeam && !isLoading && !search && sections.length > 0) {
            sections.unshift({
                ...SECTION_DETAILS.NO_TEAM,
                items: [NO_TEAM_OPTION],
            })
        }

        return sections
    }, [currentTeam, isLoading, search, teams])

    const teamOptions = useMemo<TeamOption[]>(() => {
        return teamSections.flatMap((section) => section.items)
    }, [teamSections])

    const selectedOption = useMemo(() => {
        if (!currentTeam) {
            return NO_TEAM_OPTION
        }
        return teamOptions.find((option) => option.id === currentTeam.id)
    }, [currentTeam, teamOptions])

    return {
        teamsMap,
        teamSections,
        selectedOption,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    }
}
