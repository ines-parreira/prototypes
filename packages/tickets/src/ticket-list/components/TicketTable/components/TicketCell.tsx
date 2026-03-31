import { Box, DataTableBaseCell, OverflowTooltip, Text } from '@gorgias/axiom'
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
        <DataTableBaseCell gap="xs">
            <Box
                flex={1}
                minWidth={0}
                flexDirection="column"
                gap="xs"
                alignItems="stretch"
            >
                <OverflowTooltip placement="right">
                    <Text
                        variant={ticket.is_unread ? 'bold' : 'regular'}
                        overflow="ellipsis"
                    >
                        {displaySubject}
                    </Text>
                </OverflowTooltip>
                <OverflowTooltip placement="right">
                    <Text
                        size="sm"
                        color="content-neutral-secondary"
                        overflow="ellipsis"
                    >
                        {displayExcerpt}
                    </Text>
                </OverflowTooltip>
            </Box>
            <Box flexShrink={0}>
                <TicketListItemAgentsViewing agents={otherAgentsViewing} />
            </Box>
        </DataTableBaseCell>
    )
}
