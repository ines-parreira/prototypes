import { InfluencedOrderSource } from '#shopping-assistant/constants'
import { toTicketThreadInfluencedOrderItems } from '#shopping-assistant/transforms'
import { TicketThreadItemTag } from '#thread/itemTags'

describe('toTicketThreadInfluencedOrderItems', () => {
    const baseParams = {
        ticketId: 999,
        shopifyOrders: [{ id: 789, order_number: 1001 }],
        shopifyIntegrations: [{ id: 1, name: 'Test Shop' }],
    }

    it('builds influenced order items for the current ticket', () => {
        const items = toTicketThreadInfluencedOrderItems({
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

        expect(items).toEqual([
            {
                _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
                data: {
                    created_datetime: '2024-01-01T11:00:00Z',
                    orderId: 789,
                    orderNumber: 1001,
                    shopName: 'Test Shop',
                    influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
                },
                datetime: '2024-01-01T11:00:00Z',
            },
        ])
    })

    it('filters out influenced orders that belong to another ticket', () => {
        const items = toTicketThreadInfluencedOrderItems({
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

        expect(items).toEqual([])
    })

    it('skips influenced orders with missing order or integration context', () => {
        const items = toTicketThreadInfluencedOrderItems({
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

        expect(items).toHaveLength(1)
        expect(items[0]).toMatchObject({
            data: {
                orderId: 789,
                orderNumber: 1001,
                shopName: 'Test Shop',
            },
        })
    })

    it('returns an empty list when the ticket id is missing', () => {
        const items = toTicketThreadInfluencedOrderItems({
            ...baseParams,
            ticketId: 0,
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

        expect(items).toEqual([])
    })

    it('skips malformed influenced-order bridge records', () => {
        const items = toTicketThreadInfluencedOrderItems({
            ...baseParams,
            influencedOrders: [
                {
                    id: 789,
                    ticketId: 999,
                    createdDatetime: '2024-01-01T11:00:00Z',
                    integrationId: 1,
                    source: 'shopping-assistant',
                },
                {
                    id: '789',
                    ticketId: 999,
                    createdDatetime: '2024-01-01T12:00:00Z',
                    integrationId: 1,
                    source: 'shopping-assistant',
                },
            ] as any,
            shopifyOrders: [
                { id: 789, order_number: 1001 },
                { id: '790', order_number: 1002 },
            ] as any,
            shopifyIntegrations: [
                { id: 1, name: 'Test Shop' },
                { id: '2', name: 'Invalid Shop' },
            ] as any,
        })

        expect(items).toEqual([
            {
                _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
                data: {
                    created_datetime: '2024-01-01T11:00:00Z',
                    orderId: 789,
                    orderNumber: 1001,
                    shopName: 'Test Shop',
                    influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
                },
                datetime: '2024-01-01T11:00:00Z',
            },
        ])
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
        const items = toTicketThreadInfluencedOrderItems({
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

        expect(items).toHaveLength(1)
        expect(items[0].data.influencedBy).toBe(influencedBy)
    })
})
