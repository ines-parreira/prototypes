import { renderHook } from '../../tests/render.utils'
import { TicketThreadItemTag } from '../../thread/itemTags'
import { InfluencedOrderSource } from '../constants'
import { useTicketThreadShoppingAssistantEvents } from '../hooks/useTicketThreadShoppingAssistantEvents'

describe('useTicketThreadShoppingAssistantEvents', () => {
    it('returns influenced order items from the legacy bridge for the current ticket', () => {
        const { result } = renderHook(
            () => useTicketThreadShoppingAssistantEvents({ ticketId: 7 }),
            {
                currentTicketShoppingAssistantData: {
                    influencedOrders: [
                        {
                            id: 1001,
                            integrationId: 42,
                            ticketId: 7,
                            createdDatetime: '2024-01-01T11:00:00Z',
                            source: 'shopping-assistant',
                        },
                    ],
                    shopifyOrders: [{ id: 1001, order_number: 3001 }],
                    shopifyIntegrations: [{ id: 42, name: 'Primary shop' }],
                },
            },
        )

        expect(result.current.items).toEqual([
            {
                _tag: TicketThreadItemTag.ShoppingAssistant.InfluencedOrder,
                data: {
                    created_datetime: '2024-01-01T11:00:00Z',
                    orderId: 1001,
                    orderNumber: 3001,
                    shopName: 'Primary shop',
                    influencedBy: InfluencedOrderSource.SHOPPING_ASSISTANT,
                },
                datetime: '2024-01-01T11:00:00Z',
            },
        ])
    })

    it('filters out data for other tickets', () => {
        const { result } = renderHook(
            () => useTicketThreadShoppingAssistantEvents({ ticketId: 7 }),
            {
                currentTicketShoppingAssistantData: {
                    influencedOrders: [
                        {
                            id: 1001,
                            integrationId: 42,
                            ticketId: 9,
                            createdDatetime: '2024-01-01T11:00:00Z',
                            source: 'shopping-assistant',
                        },
                    ],
                    shopifyOrders: [{ id: 1001, order_number: 3001 }],
                    shopifyIntegrations: [{ id: 42, name: 'Primary shop' }],
                },
            },
        )

        expect(result.current.items).toEqual([])
    })

    it('skips influenced orders when the Shopify context is missing', () => {
        const { result } = renderHook(
            () => useTicketThreadShoppingAssistantEvents({ ticketId: 7 }),
            {
                currentTicketShoppingAssistantData: {
                    influencedOrders: [
                        {
                            id: 1001,
                            integrationId: 42,
                            ticketId: 7,
                            createdDatetime: '2024-01-01T11:00:00Z',
                            source: 'shopping-assistant',
                        },
                    ],
                    shopifyOrders: [],
                    shopifyIntegrations: [{ id: 42, name: 'Primary shop' }],
                },
            },
        )

        expect(result.current.items).toEqual([])
    })
})
