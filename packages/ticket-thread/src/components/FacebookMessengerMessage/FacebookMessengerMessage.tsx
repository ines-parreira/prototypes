import type { TicketThreadSocialMediaFacebookMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

type FacebookMessengerMessageProps = {
    item: TicketThreadSocialMediaFacebookMessageItem
}

export function FacebookMessengerMessage({
    item,
}: FacebookMessengerMessageProps) {
    const channelFrom = item.data.source.from?.name ?? null
    const channelTo = item.data.source.to?.[0]?.name ?? null

    return (
        <SocialMessageBubble
            item={item}
            channelName="Facebook Messenger"
            channelFrom={channelFrom}
            channelTo={channelTo}
            failedMessageError="We couldn't deliver your direct message"
        >
            <MessageBody item={item} />
            <TicketMessageActions message={item.data} />
        </SocialMessageBubble>
    )
}
