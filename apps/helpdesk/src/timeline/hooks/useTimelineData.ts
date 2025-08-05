import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { Customer } from 'models/customer/types'
import { getTicketCustomer } from 'state/ticket/selectors'
import { extractOrders } from 'timeline/helpers/orders'
import * as timelineItem from 'timeline/helpers/timelineItem'
import { TimelineItem } from 'timeline/types'

import { useTicketList } from './useTicketList'

export function useTimelineData(shopperId?: number) {
    const ticketCustomer: Customer = useAppSelector(getTicketCustomer)?.toJS()

    const { tickets, isError, isLoading } = useTicketList(shopperId)

    const enableOrdersInTimeline = useFlag(
        FeatureFlagKey.ShopifyCustomerTimeline,
        false,
    )

    let items: TimelineItem[] = tickets.map((v) => timelineItem.fromTicket(v))

    if (enableOrdersInTimeline && ticketCustomer) {
        const orders = extractOrders(ticketCustomer)
        items = [...items, ...orders.map((v) => timelineItem.fromOrder(v))]
    }

    return {
        items,
        isLoading,
        isError,
        enableOrdersInTimeline,
    }
}
