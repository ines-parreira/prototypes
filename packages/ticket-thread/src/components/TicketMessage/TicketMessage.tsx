import { Box } from '@gorgias/axiom'

import {
    isActivePendingMessageItem,
    isFailedPendingMessageItem,
} from '../../hooks/messages/predicates'
import { TicketThreadPendingState } from '../../hooks/messages/types'
import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'
import { MessageAppliedActions } from '../MessageBubble/components/MessageAppliedActions'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageErrors } from '../MessageBubble/components/MessageErrors'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { getMessageChannelParticipants } from '../MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { getMessageCurrentPageUrl } from '../MessageBubble/components/MessageHeader/getMessageCurrentPageUrl'
import { getMessageViaLabel } from '../MessageBubble/components/MessageHeader/getMessageViaLabel'
import { isForwardedMessageSource } from '../MessageBubble/components/MessageHeader/isForwardedMessageSource'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageMeta } from '../MessageBubble/components/MessageHeader/MessageMeta'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { PendingMessageBanner } from '../MessageBubble/components/PendingMessageBanner'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'
import { useDisplayedTicketMessage } from './hooks/useDisplayedTicketMessage'

type TicketMessageProps = {
    item: TicketThreadRegularMessageItem
}

export function TicketMessage({ item }: TicketMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const variant = item.data.from_agent ? 'from-agent' : 'regular'
    const isPendingMessage = isActivePendingMessageItem(item)
    const isFailedPendingState = isFailedPendingMessageItem(item)
    const { from, to, cc, bcc } = getMessageChannelParticipants(
        item.data.source,
    )
    const currentPageUrl = getMessageCurrentPageUrl(item.data.meta)
    const isForwarded = isForwardedMessageSource(item.data.source)
    const channelIcon = isForwarded ? 'forward' : undefined
    const senderEmail =
        item.data.source?.type === 'email'
            ? item.data.source.from?.address
            : undefined
    return (
        <Box
            flexDirection="column"
            width="100%"
            alignItems={item.data.from_agent ? 'flex-end' : 'flex-start'}
        >
            <MessageBubble
                variant={variant}
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
                        <MessageAvatar
                            sender={item.data.sender}
                            fromAgent={item.data.from_agent}
                            showCustomerLastSeenStatus={
                                item.shouldShowCustomerLastSeenStatus
                            }
                        />
                        <MessageSender
                            sender={item.data.sender}
                            email={senderEmail}
                        />
                    </Box>
                    <Box alignItems="center" gap="xs">
                        <MessageChannel
                            channel={item.data.channel}
                            createdDatetime={item.data.created_datetime}
                            from={from}
                            to={to}
                            cc={cc}
                            bcc={bcc}
                            currentPageUrl={currentPageUrl}
                            channelIcon={channelIcon}
                            via={getMessageViaLabel(item.data.source?.type)}
                        />
                        <MessageDeliveryIcon item={item} />
                        <MessageTimestamp
                            createdDatetime={item.data.created_datetime}
                        />
                    </Box>
                </MessageHeaderContainer>
                <MessageMeta
                    meta={item.data.meta}
                    messageId={item.data.message_id}
                    source={item.data.source}
                    integrationId={item.data.integration_id}
                    isForwarded={isForwarded}
                />
                <MessageBody item={displayedItem} />
                <MessageFooter item={displayedItem} />
                <TicketMessageActions message={item.data} />
                {isPendingMessage ? (
                    <PendingMessageBanner message={displayedItem.data} />
                ) : null}
                {item.data.ticket_id && (
                    <MessageErrors
                        message={displayedItem.data}
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
