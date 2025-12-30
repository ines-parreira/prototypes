import { TicketMessageSourceType } from '@gorgias/helpdesk-types'

export function isInternalNote(sourceType?: TicketMessageSourceType): boolean {
    return sourceType === TicketMessageSourceType.InternalNote
}
