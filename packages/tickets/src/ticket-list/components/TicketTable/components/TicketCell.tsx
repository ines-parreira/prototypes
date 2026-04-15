import {
    Box,
    DataTableBaseCell,
    Icon,
    OverflowTooltip,
    Tag,
} from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { useTicketOtherAgentsViewing } from '../../../hooks/useTicketDisplayData'
import type { DisplayTextValue } from '../../../types/display'
import { TicketListItemAgentsViewing } from '../../TicketListItem/components/TicketListItemAgentsViewing'
import { DisplayText } from './DisplayText'

export type TicketCellProps = {
    ticketId: TicketCompact['id']
    isUnread?: boolean
    subject: DisplayTextValue
    excerpt: DisplayTextValue
    hasFailedMessageTag?: boolean
    currentUserId?: number
}

export function TicketCell({
    ticketId,
    isUnread = false,
    subject,
    excerpt,
    hasFailedMessageTag = false,
    currentUserId,
}: TicketCellProps) {
    const otherAgentsViewing = useTicketOtherAgentsViewing(
        ticketId,
        currentUserId,
    )

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
                    <DisplayText
                        value={subject}
                        variant={isUnread ? 'bold' : 'regular'}
                        overflow="ellipsis"
                    />
                </OverflowTooltip>
                {hasFailedMessageTag ? (
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
                ) : !excerpt.text && !excerpt.highlightedHtml ? null : (
                    <OverflowTooltip placement="right">
                        <DisplayText
                            value={excerpt}
                            size="sm"
                            color="content-neutral-secondary"
                            overflow="ellipsis"
                        />
                    </OverflowTooltip>
                )}
            </Box>
            <Box flexShrink={0}>
                <TicketListItemAgentsViewing agents={otherAgentsViewing} />
            </Box>
        </DataTableBaseCell>
    )
}
