import { useCallback } from 'react'

import type { TicketUser, User } from '@gorgias/helpdesk-queries'

import { useUpdateTicketUser } from '../hooks/useUpdateTicketUser'
import { UserAssigneeSelect } from './UserAssigneeSelect'

type Props = {
    ticketId: number
    currentAssignee: TicketUser | null
}

export function UserAssignee({ ticketId, currentAssignee }: Props) {
    const { updateTicketUser } = useUpdateTicketUser(ticketId)

    const handleChange = useCallback(
        async (user: User | null) => {
            await updateTicketUser(user)
        },
        [updateTicketUser],
    )

    return (
        <UserAssigneeSelect value={currentAssignee} onChange={handleChange} />
    )
}
