import { useCallback } from 'react'

import type { Team, TicketTeam } from '@gorgias/helpdesk-queries'

import { useUpdateTicketTeam } from '../hooks/useUpdateTicketTeam'
import { TeamAssigneeSelect } from './TeamAssigneeSelect'

type Props = {
    ticketId: number
    currentTeam: TicketTeam | null
}

export function TeamAssignee({ ticketId, currentTeam }: Props) {
    const { updateTicketTeam } = useUpdateTicketTeam(ticketId)

    const handleChange = useCallback(
        async (team: Team | null) => {
            try {
                await updateTicketTeam(team)
            } catch {}
        },
        [updateTicketTeam],
    )

    return <TeamAssigneeSelect value={currentTeam} onChange={handleChange} />
}
