import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../hooks/messages/types'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'

import css from './WhatsAppMessage.less'

type WhatsAppMessageProps = {
    item: TicketThreadSocialMediaWhatsAppMessageItem
    isGrouped?: boolean
}

export function WhatsAppMessage({ item, isGrouped }: WhatsAppMessageProps) {
    const senderName = item.data.sender.name ?? item.data.sender.email ?? ''
    const senderAvatarUrl = (
        item.data.sender.meta as { profile_picture_url?: string } | null
    )?.profile_picture_url
    const channelIcon = getSocialChannelIcon(item._tag) ?? 'channel-whatsapp'

    const messageBody = <MessageBody item={item} />

    if (isGrouped) {
        return <Box>{messageBody}</Box>
    }

    return (
        <SocialMessageBubble
            senderName={senderName}
            senderAvatarUrl={senderAvatarUrl}
            channelIcon={channelIcon}
            channelName="WhatsApp"
            openedDatetime={item.data.opened_datetime}
            createdDatetime={item.data.created_datetime}
            shouldShowStatus={item.data.from_agent}
            deliveryStatus={{
                failed_datetime: item.data.failed_datetime,
                opened_datetime: item.data.opened_datetime,
                sent_datetime: item.data.sent_datetime,
            }}
            goToLink={null}
            className={item.data.from_agent ? css.outbound : undefined}
        >
            {messageBody}
        </SocialMessageBubble>
    )
}
