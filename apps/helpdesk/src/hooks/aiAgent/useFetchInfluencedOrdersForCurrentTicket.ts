import type { UseQueryResult } from '@tanstack/react-query'

import { useGetTicketContext } from 'hooks/aiAgent/useGetTicketContext'

import type { InfluencedOrderData } from './useFetchInfluencedOrders'
import { useFetchInfluencedOrders } from './useFetchInfluencedOrders'

export const useFetchInfluencedOrdersForCurrentTicket = (): {
    influencedOrders: UseQueryResult<InfluencedOrderData[]>
    ticketContext: ReturnType<typeof useGetTicketContext>
} => {
    const ticketContext = useGetTicketContext()

    const { start: periodStart, end: periodEnd } =
        getStartAndEndDate(ticketContext)

    // Query relies on the order ids so we can safely assume that
    // if there are no orders, there are no influenced orders
    // and we can take created_at and updated_at from the orders to set the period
    const influencedOrders = useFetchInfluencedOrders({
        accountId: ticketContext.accountId,
        integrationIds: ticketContext.shopifyIntegrations.map(
            (integration) => integration.id,
        ),
        orderIds: ticketContext.orders.map((order) => order.id),
        periodStart,
        periodEnd,
    })

    return { influencedOrders, ticketContext }
}

const getOrdersCreatedAt = (
    ticketContext: ReturnType<typeof useGetTicketContext>,
): number[] | undefined => {
    if (!ticketContext.orders.length) return undefined

    const allCreatedAt = ticketContext.orders
        .map((o) => {
            const createdAt = o.created_at
                ? new Date(o.created_at).getTime()
                : undefined

            return createdAt
        })
        .reduce((acc, createdAt) => {
            if (createdAt !== undefined) acc.push(createdAt)
            return acc
        }, [] as number[])
        .filter((x): x is number => x !== undefined && !isNaN(x))

    if (!allCreatedAt.length) return undefined

    return allCreatedAt
}

const getStartAndEndDate = (
    ticketContext: ReturnType<typeof useGetTicketContext>,
): { start: string | undefined; end: string | undefined } => {
    const allCreatedAt = getOrdersCreatedAt(ticketContext)

    if (!allCreatedAt) return { start: undefined, end: undefined }
    if (!ticketContext.createdAt) {
        return { start: undefined, end: undefined }
    }
    if (!allCreatedAt.length) return { start: undefined, end: undefined }

    const firstOrder = Math.min(...allCreatedAt)
    const periodStart = new Date(
        Math.max(new Date(ticketContext.createdAt).getTime(), firstOrder),
    )
    // Set to the start of the day in UTC
    // This ensures that the period starts at 00:00:00 UTC
    // It's similar solution to what we have when set filters in stats section
    // to the start of the day
    periodStart.setUTCHours(0, 0, 0, 0)

    const periodEnd = new Date(Math.max(...allCreatedAt))
    // It's similar solution to what we have when set filters in stats section
    // to the end of the day
    periodEnd.setUTCHours(23, 59, 59, 999)

    if (periodStart.getTime() > periodEnd.getTime()) {
        return { start: undefined, end: undefined }
    }

    return { start: periodStart.toISOString(), end: periodEnd.toISOString() }
}
