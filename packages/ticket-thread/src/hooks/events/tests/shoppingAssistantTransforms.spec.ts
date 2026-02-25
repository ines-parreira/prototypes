import { InfluencedOrderSource } from '../constants'
import { toShoppingAssistantEvents } from '../transforms'

describe('toShoppingAssistantEvents', () => {
    const baseParams = {
        ticketId: 999,
        shopifyOrders: [{ id: 789, order_number: 1001 }],
        shopifyIntegrations: [{ id: 1, name: 'Test Shop' }],
    }

    it('builds events for influenced orders that belong to the current ticket', () => {
        const events = toShoppingAssistantEvents({
            ...baseParams,
            influencedOrders: [
                {
                    id: 789,
                    ticketId: 999,
                    createdDatetime: '2024-01-01T11:00:00Z',
                    integrationId: 1,
                    source: 'shopping-assistant',
                },
            ],
        })

        expect(events).toEqual([
            {
                created_datetime: '2024-01-01T11:00:00Z',
                orderId: 789,
                orderNumber: 1001,
                shopName: 'Test Shop',
                influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
            },
        ])
    })

    it('filters out influenced orders that belong to another ticket', () => {
        const events = toShoppingAssistantEvents({
            ...baseParams,
            influencedOrders: [
                {
                    id: 789,
                    ticketId: 111,
                    createdDatetime: '2024-01-01T11:00:00Z',
                    integrationId: 1,
                    source: 'shopping-assistant',
                },
            ],
        })

        expect(events).toEqual([])
    })

    it('skips influenced orders with missing order or integration context', () => {
        const events = toShoppingAssistantEvents({
            ticketId: 999,
            influencedOrders: [
                {
                    id: 789,
                    ticketId: 999,
                    createdDatetime: '2024-01-01T11:00:00Z',
                    integrationId: 1,
                    source: 'shopping-assistant',
                },
                {
                    id: 790,
                    ticketId: 999,
                    createdDatetime: '2024-01-01T12:00:00Z',
                    integrationId: 2,
                    source: 'shopping-assistant',
                },
            ],
            shopifyOrders: [{ id: 789, order_number: 1001 }],
            shopifyIntegrations: [{ id: 1, name: 'Test Shop' }],
        })

        expect(events).toHaveLength(1)
        expect(events[0]).toMatchObject({
            orderId: 789,
            orderNumber: 1001,
            shopName: 'Test Shop',
        })
    })

    it.each([
        {
            source: 'shopping-assistant',
            influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
        },
        {
            source: 'ai-journey',
            influencedBy: InfluencedOrderSource.AI_JOURNEY,
        },
        { source: 'ai-agent', influencedBy: InfluencedOrderSource.AI_AGENT },
        {
            source: 'unknown-value',
            influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
        },
        {
            source: null,
            influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
        },
        {
            source: undefined,
            influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
        },
    ])('maps source $source to influencedBy', ({ source, influencedBy }) => {
        const events = toShoppingAssistantEvents({
            ...baseParams,
            influencedOrders: [
                {
                    id: 789,
                    ticketId: 999,
                    createdDatetime: '2024-01-01T11:00:00Z',
                    integrationId: 1,
                    source,
                },
            ],
        })

        expect(events).toHaveLength(1)
        expect(events[0].influencedBy).toBe(influencedBy)
    })
})
