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
            gap="xxxxs"
        >
            <InfobarCustomCustomerFields customer={customer} />
            <InfobarBaseCustomerFields
                customer={customer}
                ticketId={ticketId}
            />
            <Box paddingTop="xxs" className={css.overflowListToggle}>
                <OverflowListShowMore leadingSlot="arrow-chevron-down">
                    Show more
                </OverflowListShowMore>
            </Box>
            <Box paddingTop="xxs" className={css.overflowListToggle}>
                <OverflowListShowLess leadingSlot="arrow-chevron-up">
                    Show less
                </OverflowListShowLess>
            </Box>
        </OverflowList>
    )
}
