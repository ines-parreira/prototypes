import {
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-queries'

import { InfobarBaseCustomerFields } from './InfobarBaseCustomerFields'
import { InfobarCustomCustomerFields } from './InfobarCustomCustomerFields'

import css from './InfobarCustomerFields.less'

export interface InfobarCustomerFieldsProps {
    customer?: TicketCustomer
    ticketId?: string
}

export function InfobarCustomerFields({
    customer,
    ticketId,
}: InfobarCustomerFieldsProps) {
    if (!customer || !customer.id) {
        return null
    }

    return (
        <OverflowList
            className={css.overflowList}
            nonExpandedLineCount={7}
            key={customer.id}
        >
            <InfobarCustomCustomerFields customer={customer} />
            <InfobarBaseCustomerFields
                customer={customer}
                ticketId={ticketId}
            />

            <OverflowListShowMore leadingSlot="arrow-chevron-down">
                Show more
            </OverflowListShowMore>
            <OverflowListShowLess leadingSlot="arrow-chevron-up">
                Show less
            </OverflowListShowLess>
        </OverflowList>
    )
}
