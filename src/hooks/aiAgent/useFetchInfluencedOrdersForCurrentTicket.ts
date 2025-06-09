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

    const periodStart = getFirstCustomerCreatedAt(ticketContext)

    const influencedOrders = useFetchInfluencedOrders({
        accountId: ticketContext.accountId,
        integrationIds: ticketContext.shopifyIntegrations.map(
            (integration) => integration.id,
        ),
        orderIds: ticketContext.orders.map((order) => order.id),
        periodStart,
    })

    return { influencedOrders, ticketContext }
}

const getFirstCustomerCreatedAt = (
    ticketContext: ReturnType<typeof useGetTicketContext>,
) =>
    ticketContext.customers.length
        ? new Date(
              Math.min(
                  ...ticketContext.customers
                      .map((c) =>
                          c.created_at
                              ? new Date(c.created_at).getTime()
                              : undefined,
                      )
                      .filter((x): x is number => x !== undefined),
              ),
          ).toISOString()
        : undefined
