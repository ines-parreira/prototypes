import classNames from 'classnames'

import {
    Box,
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { InfobarBaseCustomerFields } from './InfobarBaseCustomerFields'
import { InfobarCustomCustomerFields } from './InfobarCustomCustomerFields'

import css from './InfobarCustomerFields.less'

export interface InfobarCustomerFieldsProps {
    customer?: TicketCustomer
    ticketId?: string
    isReadOnly?: boolean
}

export function InfobarCustomerFields({
    customer,
    ticketId,
    isReadOnly = false,
}: InfobarCustomerFieldsProps) {
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)

    if (!customer || !customer.id) {
        return null
    }

    return (
        <OverflowList
            className={classNames(css.overflowList, {
                [css.overflowListFF]: hasNewOrdersSidebar,
            })}
            nonExpandedLineCount={7}
            key={customer.id}
            gap="xxxs"
        >
            <InfobarCustomCustomerFields
                customer={customer}
                isReadOnly={isReadOnly}
            />
            <InfobarBaseCustomerFields
                customer={customer}
                ticketId={ticketId}
                isReadOnly={isReadOnly}
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
