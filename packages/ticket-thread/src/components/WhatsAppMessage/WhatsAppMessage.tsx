import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'

import css from './WhatsAppMessage.less'

type WhatsAppMessageProps = {
    item: TicketThreadSocialMediaWhatsAppMessageItem
    isGrouped?: boolean
}

export function WhatsAppMessage({ item, isGrouped }: WhatsAppMessageProps) {
    const messageBody = <MessageBody item={item} />

    if (isGrouped) {
        return <Box>{messageBody}</Box>
    }

    return (
        <SocialMessageBubble
            item={item}
            channelName="WhatsApp"
            goToLink={null}
            className={item.data.from_agent ? css.outbound : undefined}
        >
            {messageBody}
        </SocialMessageBubble>
    )
}
