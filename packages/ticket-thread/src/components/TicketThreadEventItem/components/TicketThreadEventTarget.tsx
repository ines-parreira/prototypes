import { useMemo } from 'react'

import { useListAllTeams } from '@repo/teams'
import { useListAllHumanAgents } from '@repo/users'

import { Text } from '@gorgias/axiom'

type TicketThreadEventTargetProps =
    | {
          assignee_user_id: number
      }
    | {
          assignee_team_id: number
      }

export function TicketThreadEventTarget(props: TicketThreadEventTargetProps) {
    const { data: agents } = useListAllHumanAgents()
    const { data: teams } = useListAllTeams()
    const assigneeUserId =
        'assignee_user_id' in props ? props.assignee_user_id : null
    const assigneeTeamId =
        'assignee_team_id' in props ? props.assignee_team_id : null
    const eventAuthor = useMemo(
        () =>
            assigneeUserId
                ? agents?.find((agent) => agent.id === assigneeUserId)
                : null,
        [agents, assigneeUserId],
    )
    const eventTeam = useMemo(
        () =>
            assigneeTeamId
                ? teams?.find((team) => team.id === assigneeTeamId)
                : null,
        [teams, assigneeTeamId],
    )

    if (eventAuthor) {
        return (
            <Text size="sm">
                to{' '}
                <Text size="sm" variant="medium">
                    {eventAuthor.name}
                </Text>
            </Text>
        )
    }

    if (eventTeam) {
        return (
            <Text size="sm">
                to{' '}
                <Text size="sm" variant="medium">
                    {eventTeam.name}
                </Text>
            </Text>
        )
    }

    return null
}
