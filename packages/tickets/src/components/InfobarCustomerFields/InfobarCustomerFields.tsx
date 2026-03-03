import {
    Box,
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
            gap="xxxs"
        >
            <InfobarCustomCustomerFields customer={customer} />
            <InfobarBaseCustomerFields
                customer={customer}
                ticketId={ticketId}
            />
            <Box className={css.overflowListToggle}>
                <OverflowListShowMore
                    leadingSlot="arrow-chevron-down"
                    className={css.overflowListToggle}
                >
                    Show more
                </OverflowListShowMore>
            </Box>
            <Box className={css.overflowListToggle}>
                <OverflowListShowLess
                    leadingSlot="arrow-chevron-up"
                    className={css.overflowListToggle}
                >
                    Show less
                </OverflowListShowLess>
            </Box>
        </OverflowList>
    )
}
