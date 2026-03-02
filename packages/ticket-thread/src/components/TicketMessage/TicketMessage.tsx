import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { MessageHeader } from '../MessageBubble/MessageHeader'

type TicketMessageProps = {
    item: TicketThreadRegularMessageItem
}

export function TicketMessage({ item }: TicketMessageProps) {
    return (
        <MessageBubble>
            <MessageHeader
                item={item}
                shouldShowStatus={item.data.from_agent}
            />
            {item.data.stripped_text || item.data.body_text}
        </MessageBubble>
    )
}
