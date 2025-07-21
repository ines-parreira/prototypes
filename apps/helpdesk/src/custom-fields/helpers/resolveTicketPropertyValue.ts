import { ExpressionFieldSource } from '@gorgias/helpdesk-types'

import { CustomFieldState } from 'custom-fields/types'
import { TicketStateWithoutImmutable } from 'state/ticket/types'

export const enum SupportedTicketFields {
    Status = 'status',
    Channel = 'channel',
}

const resolveTicketPropertyValue = (
    ticket: TicketStateWithoutImmutable,
    source: ExpressionFieldSource,
    property: SupportedTicketFields | number,
): string | number | boolean | null => {
    const isNumber = typeof property === 'number'

    if (source === ExpressionFieldSource.Ticket && !isNumber) {
        return ticket[property]
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

export default resolveTicketPropertyValue
