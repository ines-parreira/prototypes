import { TicketMessageSourceType } from 'business/types/ticket'

/**
 * Return true if can leave internal note
 */
export default function canLeaveInternalNote(
    sourceType: TicketMessageSourceType,
): boolean {
    return sourceType === TicketMessageSourceType.InternalNote
}
