import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../hooks/messages/types'
import { TicketMessageActions } from './TicketMessageActions'
import { WhatsAppMessage } from './WhatsAppMessage'

type WhatsAppMessageWrapperProps = {
    item: TicketThreadSocialMediaWhatsAppMessageItem
}

export function WhatsAppMessageWrapper({ item }: WhatsAppMessageWrapperProps) {
    const copyText = item.data.stripped_text || item.data.body_text || ''

    return (
        <WhatsAppMessage
            item={item}
            actions={
                <TicketMessageActions message={item.data} copyText={copyText} />
            }
        />
    )
}
