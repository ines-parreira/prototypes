import {TicketMessageSourceType} from 'business/types/ticket'

/**
 * Return true if type supports HTML content
 */
export default function isRichType(
    sourceType: TicketMessageSourceType
): boolean {
    return [
        TicketMessageSourceType.Email,
        TicketMessageSourceType.InternalNote,
        TicketMessageSourceType.Chat,
    ].includes(sourceType)
}
