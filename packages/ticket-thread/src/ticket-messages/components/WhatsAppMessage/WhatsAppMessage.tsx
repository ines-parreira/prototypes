import { Box } from '@gorgias/axiom'

import { MessageBody } from '#ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageFooter } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { SocialMessageBubble } from '#ticket-messages/components/SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '#ticket-messages/components/TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '#ticket-messages/components/TicketMessageActions/TicketMessageActions'
import type { TicketThreadSocialMediaWhatsAppMessageItem } from '#ticket-messages/types'

type WhatsAppMessageProps = {
    item: TicketThreadSocialMediaWhatsAppMessageItem
    isGrouped?: boolean
}

export function WhatsAppMessage({ item, isGrouped }: WhatsAppMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const messageContent = (
        <>
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
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
        <SocialMessageBubble
            item={displayedItem}
            channelName="WhatsApp"
            goToLink={null}
        >
            {messageContent}
            <TicketMessageActions message={displayedItem.data} />
        </SocialMessageBubble>
    )
}
