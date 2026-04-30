import { useCallback } from 'react'

import type { TicketTag } from '@gorgias/helpdesk-queries'

import { useGetTicketData } from './hooks/useGetTicketData'
import {
    sortByAlphabeticalTagNameOrder,
    useUpdateTicketTags,
} from './hooks/useUpdateTicketTags'
import { TagsMultiSelect } from './TagsMultiSelect'
import { TicketInfobarTicketDetailsTagsContainer } from './TicketInfobarTicketDetailsTagsContainer'

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
                tags: tags.sort(sortByAlphabeticalTagNameOrder),
            })
        },
        [updateTicketTags, ticketId],
    )

    return (
        <TicketInfobarTicketDetailsTagsContainer>
            <TagsMultiSelect
                value={ticket?.data.tags ?? []}
                onChange={handleChange}
                aria-label="Ticket tags selection"
            />
        </TicketInfobarTicketDetailsTagsContainer>
    )
}
