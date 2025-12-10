import React from 'react'

import { useParams } from 'react-router-dom'

import {
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'

import { useBaseCustomerFields } from './hooks/useBaseCustomerFields'
import { InfobarBaseCustomerFields } from './InfobarBaseCustomerFields'
import { InfobarCustomCustomerFields } from './InfobarCustomCustomerFields'

import css from './InfobarCustomerFields.less'

export function InfobarCustomerFields() {
    const { ticketId } = useParams<{ ticketId: string }>()
    const { customer } = useBaseCustomerFields(ticketId!)

    if (!ticketId || !customer) {
        return null
    }

    return (
        <OverflowList className={css.overflowList} nonExpandedLineCount={7}>
            <InfobarCustomCustomerFields customerId={customer.id} />
            <InfobarBaseCustomerFields ticketId={ticketId} />

            <OverflowListShowMore
                // @ts-ignore - this will be added as a valid prop
                leadingSlot="arrow-chevron-down"
            >
                Show more
            </OverflowListShowMore>
            <OverflowListShowLess
                // @ts-ignore - this will be added as a valid prop
                leadingSlot="arrow-chevron-up"
            >
                Show less
            </OverflowListShowLess>
        </OverflowList>
    )
}
