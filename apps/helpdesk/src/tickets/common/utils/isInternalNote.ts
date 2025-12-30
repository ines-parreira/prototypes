import { TicketMessageSourceType } from 'business/types/ticket'

/**
 * @deprecated Use isInternalNote from @gorgias/tickets package instead
 * @date 2025-12-22
 * @type tickets-migration
 * Return true if the message's source type identifies an internal note
 */
export default function isInternalNote(
    sourceType?: TicketMessageSourceType,
): boolean {
    return sourceType === TicketMessageSourceType.InternalNote
}
