import { TicketMessageSourceType } from 'business/types/ticket'

/**
 * Return true if the message's source type identifies an internal note
 */
export default function isInternalNote(
    sourceType?: TicketMessageSourceType,
): boolean {
    return sourceType === TicketMessageSourceType.InternalNote
}
