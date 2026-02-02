import { useCallback } from 'react'

import type { TicketPriority as TicketPriorityType } from '@gorgias/helpdesk-queries'

import { useUpdateTicketPriority } from '../hooks/useUpdateTicketPriority'
import { PrioritySelect } from './PrioritySelect'

type Props = {
    ticketId: number
    currentPriority?: TicketPriorityType
}

export function TicketPriority({ ticketId, currentPriority }: Props) {
    const { updateTicketPriority, isLoading } =
        useUpdateTicketPriority(ticketId)

    const handleChange = useCallback(
        async (priority: TicketPriorityType) => {
            await updateTicketPriority(priority)
        },
        [updateTicketPriority],
    )

    return (
        <PrioritySelect
            value={currentPriority}
            onChange={handleChange}
            isLoading={isLoading}
        />
    )
}
