import type { TicketCustomer } from '@gorgias/helpdesk-types'

export function getCustomerName(customer?: TicketCustomer): string {
    if (!customer) return 'Unknown customer'

    return (
        customer.name ||
        customer.email ||
        (customer.id ? `Customer #${customer.id}` : 'Unknown customer')
    )
}
