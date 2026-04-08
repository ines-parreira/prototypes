import {
    Box,
    DataTableBaseCell,
    Icon,
    OverflowTooltip,
    Tag,
    Text,
} from '@gorgias/axiom'
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
                {ticket.last_sent_message_not_delivered ? (
                    <Box alignSelf="flex-start">
                        <Tag
                            color="red"
                            leadingSlot={
                                <Icon name="triangle-warning" size="sm" />
                            }
                        >
                            Last message not delivered
                        </Tag>
                    </Box>
                ) : (
                    displayExcerpt && (
                        <OverflowTooltip placement="right">
                            <Text
                                size="sm"
                                color="content-neutral-secondary"
                                overflow="ellipsis"
                            >
                                {displayExcerpt}
                            </Text>
                        </OverflowTooltip>
                    )
                )}
            </Box>
            <Box flexShrink={0}>
                <TicketListItemAgentsViewing agents={otherAgentsViewing} />
            </Box>
        </DataTableBaseCell>
    )
}
