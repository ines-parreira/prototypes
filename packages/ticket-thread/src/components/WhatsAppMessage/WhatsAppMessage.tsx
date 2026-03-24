import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'

type WhatsAppMessageProps = {
    item: TicketThreadSocialMediaWhatsAppMessageItem
    isGrouped?: boolean
    actions?: ReactNode
}

export function WhatsAppMessage({
    item,
    isGrouped,
    actions,
}: WhatsAppMessageProps) {
    const messageBody = <MessageBody item={item} />
    if (isGrouped) {
        return <Box>{messageBody}</Box>
    }

    return (
        <SocialMessageBubble
            item={item}
            channelName="WhatsApp"
            goToLink={null}
            actions={actions}
        >
            {messageBody}
        </SocialMessageBubble>
    )
}
