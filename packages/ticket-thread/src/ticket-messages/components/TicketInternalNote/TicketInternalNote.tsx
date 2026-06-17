import { Box } from '@gorgias/axiom'

import { MessageAppliedActions } from '#ticket-messages/components/MessageBubble/components/MessageAppliedActions'
import { MessageBody } from '#ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageErrors } from '#ticket-messages/components/MessageBubble/components/MessageErrors'
import { MessageFooter } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { MessageHeaderContainer } from '#ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '#ticket-messages/components/MessageBubble/MessageBubble'
import { TicketMessageActions } from '#ticket-messages/components/TicketMessageActions/TicketMessageActions'
import {
    isActivePendingMessageItem,
    isFailedPendingMessageItem,
} from '#ticket-messages/predicates'
import { TicketThreadPendingState } from '#ticket-messages/types'
import type { TicketThreadInternalNoteItem } from '#ticket-messages/types'

import css from './TicketInternalNote.less'

type TicketInternalNoteProps = {
    item: TicketThreadInternalNoteItem
}

export function TicketInternalNote({ item }: TicketInternalNoteProps) {
    const isPendingMessage = isActivePendingMessageItem(item)
    const isFailedPendingState = isFailedPendingMessageItem(item)

    return (
        <Box flexDirection="column" width="100%" alignItems="flex-end">
            <MessageBubble
                variant="internal-note"
                pendingState={
                    isFailedPendingState
                        ? TicketThreadPendingState.Failed
                        : isPendingMessage
                          ? TicketThreadPendingState.Active
                          : undefined
                }
            >
                <MessageHeaderContainer>
                    <Box alignItems="center" gap="xs">
                        <MessageAvatar sender={item.data.sender} fromAgent />
                        <MessageSender sender={item.data.sender} />
                    </Box>
                    <Box alignItems="center" gap="xs">
                        <MessageChannel
                            channel={item.data.channel}
                            createdDatetime={item.data.created_datetime}
                            channelIcon="note"
                            variant="internal-note"
                        />
                        <MessageTimestamp
                            createdDatetime={item.data.created_datetime}
                        />
                    </Box>
                </MessageHeaderContainer>
                <MessageBody item={item} className={css.internalNoteContent} />
                <MessageFooter item={item} showTranslations={false} />
                <TicketMessageActions message={item.data} />
                {item.data.ticket_id && (
                    <MessageErrors
                        message={item.data}
                        ticketId={item.data.ticket_id}
                        isPending={isPendingMessage}
                    />
                )}
            </MessageBubble>
            <MessageAppliedActions
                message={item.data}
                isPending={isPendingMessage}
            />
        </Box>
    )
}
