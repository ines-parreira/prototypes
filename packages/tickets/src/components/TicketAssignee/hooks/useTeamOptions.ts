import { useMemo, useState } from 'react'

import { useListAllTeams } from '@repo/teams'

import type { Team, TicketTeam } from '@gorgias/helpdesk-queries'

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

type TeamWithRequiredFields = Team & {
    id: NonNullable<Team['id']>
    name: NonNullable<Team['name']>
}

type UseTeamOptionsParams = {
    currentTeam?: TicketTeam | null
    enabled?: boolean
}

export function useTeamOptions({
    currentTeam,
    enabled = true,
}: UseTeamOptionsParams) {
    const [search, setSearch] = useState('')
    const { data: allTeams = [], isLoading } = useListAllTeams({ enabled })

    const teams = useMemo<TeamWithRequiredFields[]>(() => {
        const validTeams = allTeams.filter(
            (team): team is TeamWithRequiredFields =>
                typeof team.id === 'number' && typeof team.name === 'string',
        )

        const sortedTeams = [...validTeams].sort((teamA, teamB) =>
            teamA.name.localeCompare(teamB.name),
        )

        if (!search) {
            return sortedTeams
        }

        const searchValue = search.toLowerCase()
        return sortedTeams.filter((team) =>
            team.name.toLowerCase().includes(searchValue),
        )
    }, [allTeams, search])

    const teamsMap = useMemo(() => {
        return new Map(allTeams.map((team) => [team.id, team]))
    }, [allTeams])

    const teamSections = useMemo<TeamSection[]>(() => {
        const sections: TeamSection[] = []

        if (teams.length > 0 || currentTeam) {
            let isCurrentTeamLoaded = false
            const items = teams.map((team): TeamOption => {
                if (
                    typeof currentTeam?.id === 'number' &&
                    team.id === currentTeam.id
                ) {
                    isCurrentTeamLoaded = true
                }
                return {
                    id: team.id,
                    label: team.name,
                }
            })

            if (
                currentTeam &&
                !isCurrentTeamLoaded &&
                typeof currentTeam.id === 'number' &&
                typeof currentTeam.name === 'string'
            ) {
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
        onLoad: () => undefined,
        shouldLoadMore: false,
    }
}
