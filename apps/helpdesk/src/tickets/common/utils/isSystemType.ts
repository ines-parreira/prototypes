import { TicketMessageSourceType } from 'business/types/ticket'
import { SYSTEM_SOURCE_TYPES } from 'tickets/common/config'

/**
 * Return true if passed source type is a system source type
 */
export default function isSystemType(
    sourceType: TicketMessageSourceType,
): boolean {
    return SYSTEM_SOURCE_TYPES.includes(sourceType)
}
