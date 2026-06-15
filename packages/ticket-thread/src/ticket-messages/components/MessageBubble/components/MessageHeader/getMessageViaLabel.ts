import { TicketMessageSourceType } from '@gorgias/helpdesk-types'

export function getMessageViaLabel(channel: string | null | undefined) {
    if (channel === TicketMessageSourceType.ChatContactForm)
        return 'contact form'
    if (channel === TicketMessageSourceType.ChatOfflineCapture)
        return 'offline capture'
    return null
}
