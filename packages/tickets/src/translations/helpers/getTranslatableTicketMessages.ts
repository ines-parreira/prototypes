import type {
    TicketMessage,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-types'

import { isInternalNote } from '../../helpers/isInternalNote'

export function isTranslatableTicketMessage(
    message: TicketMessage,
): message is TicketMessage & { id: number } {
    if (!message.id) {
        return false
    }

    if (
        message.source &&
        isInternalNote(message.source.type as TicketMessageSourceType)
    ) {
        return false
    }

    return true
}

export function getTranslatableTicketMessages(ticketMessages: TicketMessage[]) {
    return ticketMessages.filter(isTranslatableTicketMessage)
}
