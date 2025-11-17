import { isEmpty } from 'lodash'

import useAppSelector from 'hooks/useAppSelector'
import type { Customer } from 'models/customer/types'
import { getActiveCustomer } from 'state/customers/selectors'
import { getTicketCustomer } from 'state/ticket/selectors'
import { extractOrders } from 'timeline/helpers/orders'
import * as timelineItem from 'timeline/helpers/timelineItem'
import type { TimelineItem } from 'timeline/types'

import { useTicketList } from './useTicketList'

export function useTimelineData(shopperId?: number) {
    const ticketCustomer: Customer = useAppSelector(getTicketCustomer)?.toJS()
    const activeCustomer = useAppSelector(getActiveCustomer)

    const customer: Customer = isEmpty(ticketCustomer)
        ? (activeCustomer as Customer)
        : ticketCustomer

    const { tickets, isError, isLoading } = useTicketList(shopperId)

    let items: TimelineItem[] = tickets.map((v) => timelineItem.fromTicket(v))

    if (activeCustomer) {
        const orders = extractOrders(customer)
        items = [...items, ...orders.map((v) => timelineItem.fromOrder(v))]
    }

    return {
        items,
        isLoading,
        isError,
    }
}
