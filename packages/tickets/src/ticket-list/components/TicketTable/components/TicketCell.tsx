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
    messagesCount?: TicketCompact['messages_count']
    isUnread?: boolean
    subject: DisplayTextValue
    excerpt: DisplayTextValue
    hasFailedMessageTag?: boolean
    currentUserId?: number
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

export function TicketCell({
    ticketId,
    messagesCount = 0,
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
    const subjectWithMessageCount =
        messagesCount > 1
            ? {
                  text: `(${messagesCount}) ${subject.text}`,
                  highlightedHtml: subject.highlightedHtml
                      ? `(${messagesCount}) ${subject.highlightedHtml}`
                      : subject.highlightedHtml,
              }
            : subject

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
                        value={subjectWithMessageCount}
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
            <Box flexShrink={0} paddingLeft="xs">
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
