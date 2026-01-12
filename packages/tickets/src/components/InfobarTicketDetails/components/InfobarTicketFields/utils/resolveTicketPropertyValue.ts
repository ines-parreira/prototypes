import { ExpressionFieldSource } from '@gorgias/helpdesk-types'

import type { CustomFieldState } from '../store/useTicketFieldsStore'

export const enum SupportedTicketFields {
    Status = 'status',
    Channel = 'channel',
}

/**
 * Resolves a property value from a ticket object for conditional evaluation
 *
 * @param ticket - The ticket object (must include custom_fields if evaluating custom fields)
 * @param source - The source type (Ticket or TicketCustomFields)
 * @param property - The property name (string for ticket fields, number for custom fields)
 * @returns The resolved value or null if not found
 */
export const resolveTicketPropertyValue = (
    ticket: Record<string, any>,
    source: ExpressionFieldSource,
    property: SupportedTicketFields | number,
): string | number | boolean | null => {
    const isNumber = typeof property === 'number'

    if (source === ExpressionFieldSource.Ticket && !isNumber) {
        return ticket[property] ?? null
    } else if (
        source === ExpressionFieldSource.TicketCustomFields &&
        isNumber
    ) {
        const ticketFieldState: CustomFieldState | null =
            ticket.custom_fields?.[property] ?? null
        return ticketFieldState?.value ?? null
    }
    throw new Error(
        `Unsupported source "${source}" for given property "${property}".`,
    )
}
