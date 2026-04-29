import {
    Box,
    DataTableBaseCell,
    Icon,
    OverflowTooltip,
    Tag,
} from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'

import { useTicketOtherAgentsViewing } from '../../../hooks/useTicketDisplayData'
import { TicketListItemAgentsViewing } from '../../TicketListItem/components/TicketListItemAgentsViewing'
import type { TicketTableRow } from '../TicketTableColumns'
import { DisplayText } from './DisplayText'

export type TicketCellProps = CellContext<TicketTableRow, unknown> & {
    currentUserId?: number
}

export function TicketCell({ currentUserId, ...cellContext }: TicketCellProps) {
    const ticket = cellContext.row.original
    const messagesCount = ticket.messages_count ?? 0
    const isUnread = ticket.is_unread ?? false
    const hasFailedMessageTag = !!ticket.last_sent_message_not_delivered
    const subject = ticket.displaySubject
    const excerpt = ticket.displayExcerpt

    const otherAgentsViewing = useTicketOtherAgentsViewing(
        ticket.id,
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

    return (
        <DataTableBaseCell {...cellContext} gap="xs">
            <Box
                flex={1}
                minWidth={0}
                flexDirection="column"
                gap={hasFailedMessageTag ? 0 : 'xxs'}
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
                <TicketListItemAgentsViewing
                    agents={otherAgentsViewing}
                    avatarSize="md"
                />
            </Box>
        </DataTableBaseCell>
    )
}
