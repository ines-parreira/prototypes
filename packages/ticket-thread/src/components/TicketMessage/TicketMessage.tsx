import { Box } from '@gorgias/axiom'

import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from './hooks/useDisplayedTicketMessage'

type TicketMessageProps = {
    item: TicketThreadRegularMessageItem
}

export function TicketMessage({ item }: TicketMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
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
                    <MessageDeliveryIcon item={item} />
                    <MessageTimestamp
                        createdDatetime={item.data.created_datetime}
                    />
                </Box>
            </MessageHeaderContainer>
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
        </MessageBubble>
    )
}
