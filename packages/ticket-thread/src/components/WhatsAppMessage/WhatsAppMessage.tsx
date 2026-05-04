import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../hooks/messages/types'
import { MessageAttachments } from '../MessageBubble/components/MessageAttachments'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

type WhatsAppMessageProps = {
    item: TicketThreadSocialMediaWhatsAppMessageItem
    isGrouped?: boolean
}

export function WhatsAppMessage({ item, isGrouped }: WhatsAppMessageProps) {
    const messageContent = (
        <>
            <MessageBody item={item} />
            <MessageAttachments item={item} />
        </>
    )
    if (isGrouped) {
        return (
            <Box flexDirection="column" gap="xs">
                {messageContent}
            </Box>
        )
    }

    return (
        <SocialMessageBubble item={item} channelName="WhatsApp" goToLink={null}>
            {messageContent}
            <TicketMessageActions message={item.data} />
        </SocialMessageBubble>
    )
}
