import { TicketMessageSourceType } from 'business/types/ticket'

/**
 * Return true if source type is public type
 */
export function isPublic(sourceType: TicketMessageSourceType): boolean {
    return sourceType !== TicketMessageSourceType.InternalNote
}
