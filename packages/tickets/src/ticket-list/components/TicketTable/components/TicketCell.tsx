import { Box, DataTableBaseCell, Text } from '@gorgias/axiom'
import type {
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { useTicketDisplayData } from '../../../hooks/useTicketDisplayData'
import { TicketListItemAgentsViewing } from '../../TicketListItem/components/TicketListItemAgentsViewing'

export type TicketCellProps = {
    ticket: TicketCompact
    translation: TicketTranslationCompact | undefined
    showTranslatedContent: boolean
    currentUserId?: number
}

export function TicketCell({
    ticket,
    translation,
    showTranslatedContent,
    currentUserId,
}: TicketCellProps) {
    const { displaySubject, displayExcerpt, otherAgentsViewing } =
        useTicketDisplayData({
            ticket,
            translation,
            showTranslatedContent,
            currentUserId,
        })

    return (
        <DataTableBaseCell
            flexDirection="column"
            gap="xxxxs"
            alignItems="stretch"
        >
            <Text variant={ticket.is_unread ? 'bold' : 'regular'}>
                {displaySubject}
            </Text>
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="baseline"
                gap="xxxs"
            >
                <Text
                    size="xs"
                    color="content-neutral-secondary"
                    overflow="ellipsis"
                >
                    {displayExcerpt}
                </Text>
                <TicketListItemAgentsViewing agents={otherAgentsViewing} />
            </Box>
        </DataTableBaseCell>
    )
}
