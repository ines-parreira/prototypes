import type { TicketThreadSocialMediaInstagramDirectMessageItem } from '../../hooks/messages/types'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

type InstagramDirectMessageProps = {
    item: TicketThreadSocialMediaInstagramDirectMessageItem
}

export function InstagramDirectMessage({ item }: InstagramDirectMessageProps) {
    const channelFrom = item.data.source.from?.name ?? null
    const channelTo = item.data.source.to?.[0]?.name ?? null

    return (
        <SocialMessageBubble
            item={item}
            channelIcon={getSocialChannelIcon(item._tag) ?? 'comm-instagram'}
            channelName="Instagram Direct Message"
            channelFrom={channelFrom}
            channelTo={channelTo}
        >
            <MessageBody item={item} />
            <TicketMessageActions message={item.data} />
        </SocialMessageBubble>
    )
}
