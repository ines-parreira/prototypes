import { useParams } from 'react-router-dom'

import {
    OverflowList,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'

import { useGetTicketData } from '../InfobarTicketDetails/components/InfobarTicketDetailsTags/hooks/useGetTicketData'
import { InfobarBaseCustomerFields } from './InfobarBaseCustomerFields'
import { InfobarCustomCustomerFields } from './InfobarCustomCustomerFields'

import css from './InfobarCustomerFields.less'

export function InfobarCustomerFields() {
    const { ticketId } = useParams<{ ticketId: string }>()
    const { data: ticket } = useGetTicketData(ticketId)
    const customer = ticket?.data?.customer

    if (!ticketId || !customer) {
        return null
    }

    return (
        <OverflowList className={css.overflowList} nonExpandedLineCount={7}>
            <InfobarCustomCustomerFields customer={customer} />
            <InfobarBaseCustomerFields
                ticketId={ticketId}
                customer={customer}
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
