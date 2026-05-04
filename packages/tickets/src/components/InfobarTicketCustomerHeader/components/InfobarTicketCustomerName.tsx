import { Link } from 'react-router-dom'

import { Avatar, Heading } from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import css from './InfobarTicketCustomerHeaderContainer.less'

export interface InfobarTicketCustomerNameProps {
    customer: TicketCustomer
}

export function InfobarTicketCustomerName({
    customer,
}: InfobarTicketCustomerNameProps) {
    const customerDisplayName = customer.name || `Customer #${customer.id}`

    return (
        <Link
            to={`/app/customer/${customer.id}`}
            className={css.customerLink}
            aria-label={customerDisplayName}
        >
            <Avatar name={customerDisplayName} size="md" />
            <Heading size="sm">{customerDisplayName}</Heading>
        </Link>
    )
}
