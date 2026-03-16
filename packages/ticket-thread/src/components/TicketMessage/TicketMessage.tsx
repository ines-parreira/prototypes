import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/MessageBody'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { MessageHeader } from '../MessageBubble/MessageHeader'

type TicketMessageProps = {
    item: TicketThreadRegularMessageItem
}

export function TicketMessage({ item }: TicketMessageProps) {
    const senderName = item.data.sender.name ?? item.data.sender.email ?? ''
    const senderAvatarUrl = (
        item.data.sender.meta as { profile_picture_url?: string } | null
    )?.profile_picture_url
    const channelIcon = item.data.channel === 'email' ? 'comm-mail' : null

    return (
        <MessageBubble>
            <MessageHeader
                senderName={senderName}
                senderAvatarUrl={senderAvatarUrl}
                channelIcon={channelIcon}
                createdDatetime={item.data.created_datetime}
                shouldShowStatus={item.data.from_agent}
                deliveryStatus={{
                    failed_datetime: item.data.failed_datetime,
                    isPending: item.isPending,
                    opened_datetime: item.data.opened_datetime,
                    sent_datetime: item.data.sent_datetime,
                }}
            />
            <MessageBody item={item} />
        </MessageBubble>
    )
}
