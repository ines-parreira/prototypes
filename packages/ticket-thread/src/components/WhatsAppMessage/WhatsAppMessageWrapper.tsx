import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaWhatsAppMessageItem } from '../../hooks/messages/types'
import { TicketMessageActions } from './TicketMessageActions'
import { WhatsAppMessage } from './WhatsAppMessage'

import css from '../MessageBubble/MessageBubble.less'

type WhatsAppMessageWrapperProps = {
    item: TicketThreadSocialMediaWhatsAppMessageItem
}

export function WhatsAppMessageWrapper({ item }: WhatsAppMessageWrapperProps) {
    const fromAgent = item.data.from_agent ?? false
    const copyText = item.data.stripped_text || item.data.body_text || ''
    const actions = (
        <TicketMessageActions message={item.data} copyText={copyText} />
    )
    return (
        <Box
            flexDirection="row"
            alignItems="center"
            gap="xs"
            className={css.messageWrapper}
        >
            {fromAgent && actions}
            <WhatsAppMessage item={item} />
            {!fromAgent && actions}
        </Box>
    )
}
