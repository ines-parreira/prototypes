import { Box, IconName } from '@gorgias/axiom'

import {
    isActivePendingMessageItem,
    isFailedPendingMessageItem,
} from '../../hooks/messages/predicates'
import { TicketThreadPendingState } from '../../hooks/messages/types'
import type { TicketThreadInternalNoteItem } from '../../hooks/messages/types'
import { MessageAppliedActions } from '../MessageBubble/components/MessageAppliedActions'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageErrors } from '../MessageBubble/components/MessageErrors'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

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
                            channelIcon={IconName.Note}
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
