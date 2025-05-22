import { UseQueryResult } from '@tanstack/react-query'

import { useGetTicketContext } from 'hooks/aiAgent/useGetTicketContext'

import {
    InfluencedOrderData,
    useFetchInfluencedOrders,
} from './useFetchInfluencedOrders'

export const useFetchInfluencedOrdersForCurrentTicket = (): {
    influencedOrders: UseQueryResult<InfluencedOrderData[]>
    ticketContext: ReturnType<typeof useGetTicketContext>
} => {
    const ticketContext = useGetTicketContext()

    const influencedOrders = useFetchInfluencedOrders({
        accountId: ticketContext.accountId,
        customerIds: ticketContext.customerIds,
    })

    return { influencedOrders, ticketContext }
}
