import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

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
