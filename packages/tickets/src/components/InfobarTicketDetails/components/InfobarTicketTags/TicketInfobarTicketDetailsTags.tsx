import { useCallback } from 'react'

import type { TicketTag } from '@gorgias/helpdesk-queries'

import { useGetTicketData } from './hooks/useGetTicketData'
import {
    sortByAscendingIdOrder,
    useUpdateTicketTags,
} from './hooks/useUpdateTicketTags'
import { TagsMultiSelect } from './TagsMultiSelect'

type TicketInfobarTicketDetailsTagsProps = {
    ticketId: string
}

export function TicketInfobarTicketDetailsTags({
    ticketId,
}: TicketInfobarTicketDetailsTagsProps) {
    const { updateTicketTags } = useUpdateTicketTags(ticketId)
    const { data: ticket } = useGetTicketData(ticketId)

    const handleChange = useCallback(
        async (tags: TicketTag[]) => {
            await updateTicketTags(Number(ticketId), {
                tags: tags.sort(sortByAscendingIdOrder),
            })
        },
        [updateTicketTags, ticketId],
    )

    return (
        <TagsMultiSelect
            value={ticket?.data.tags ?? []}
            onChange={handleChange}
            aria-label="Ticket tags selection"
        />
    )
}
