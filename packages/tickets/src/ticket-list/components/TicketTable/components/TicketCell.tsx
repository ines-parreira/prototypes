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
import type { TicketTableCellLinkProps } from './TicketTableCellLink'
import { TicketTableCellLink } from './TicketTableCellLink'

export type TicketCellProps = {
    ticketId: TicketCompact['id']
    isUnread?: boolean
    subject: DisplayTextValue
    excerpt: DisplayTextValue
    hasFailedMessageTag?: boolean
    currentUserId?: number
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

export function TicketCell({
    ticketId,
    isUnread = false,
    subject,
    excerpt,
    hasFailedMessageTag = false,
    currentUserId,
    linkProps,
}: TicketCellProps) {
    const otherAgentsViewing = useTicketOtherAgentsViewing(
        ticketId,
        currentUserId,
    )

    const content = (
        <>
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
        </>
    )

    if (linkProps) {
        return (
            <TicketTableCellLink {...linkProps} gap="xs">
                {content}
            </TicketTableCellLink>
        )
    }

    return <DataTableBaseCell gap="xs">{content}</DataTableBaseCell>
}
