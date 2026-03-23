import { Box } from '@gorgias/axiom'

import type { TicketThreadSingleMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'

type UnimplementedMessageProps = {
    item: TicketThreadSingleMessageItem
}

export function UnimplementedMessage({ item }: UnimplementedMessageProps) {
    const variant = item.data.from_agent ? 'from-agent' : 'regular'

    return (
        <MessageBubble variant={variant}>
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <MessageAvatar sender={item.data.sender} />
                    <MessageSender sender={item.data.sender} />
                </Box>
                <Box alignItems="center" gap="xs">
                    <MessageChannel
                        channel={item.data.channel}
                        createdDatetime={item.data.created_datetime}
                    />
                    <MessageTimestamp
                        createdDatetime={item.data.created_datetime}
                    />
                </Box>
            </MessageHeaderContainer>
            <MessageBody item={item} />
        </MessageBubble>
    )
}
