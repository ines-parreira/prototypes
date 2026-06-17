import { Box } from '@gorgias/axiom'

import { MessageBody } from '#ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageFooter } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { getMessageChannelParticipants } from '#ticket-messages/components/MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { MessageHeaderContainer } from '#ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '#ticket-messages/components/MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '#ticket-messages/components/TicketMessage/hooks/useDisplayedTicketMessage'
import type {
    TicketThreadSocialMediaTwitterDirectMessageItem,
    TicketThreadSocialMediaTwitterTweetItem,
} from '#ticket-messages/types'

type UnimplementedMessageProps = {
    item:
        | TicketThreadSocialMediaTwitterDirectMessageItem
        | TicketThreadSocialMediaTwitterTweetItem
}

export function UnimplementedMessage({ item }: UnimplementedMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const message = displayedItem.data
    const variant = message.from_agent ? 'from-agent' : 'regular'
    const { from, to, cc, bcc } = getMessageChannelParticipants(message.source)

    return (
        <MessageBubble variant={variant}>
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <MessageAvatar
                        sender={message.sender}
                        fromAgent={message.from_agent}
                        showCustomerLastSeenStatus={
                            item.shouldShowCustomerLastSeenStatus
                        }
                    />
                    <MessageSender sender={message.sender} />
                </Box>
                <Box alignItems="center" gap="xs">
                    <MessageChannel
                        channel={message.channel}
                        createdDatetime={message.created_datetime}
                        from={from}
                        to={to}
                        cc={cc}
                        bcc={bcc}
                    />
                    <MessageTimestamp
                        createdDatetime={message.created_datetime}
                    />
                </Box>
            </MessageHeaderContainer>
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
        </MessageBubble>
    )
}
