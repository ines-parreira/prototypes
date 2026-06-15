import { Box } from '@gorgias/axiom'

import type {
    TicketThreadSocialMediaTwitterDirectMessageItem,
    TicketThreadSocialMediaTwitterTweetItem,
} from '../../types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { getMessageChannelParticipants } from '../MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'

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
