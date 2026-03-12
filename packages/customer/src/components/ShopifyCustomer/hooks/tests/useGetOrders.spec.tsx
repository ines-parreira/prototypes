import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockEcommerceData,
    mockListEcommerceDataHandler,
    mockPaginatedDataEcommerceData,
} from '@gorgias/ecommerce-storage-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import type { OrderData } from '../../types'
import { useGetOrders } from '../useGetOrders'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const SHOPPER_IDENTITY_ID = '01956de4-e1ff-7523-ac68-a00ca2dd6e3f'

const mockOrderData: OrderData = {
    id: 12345,
    order_number: 1001,
    name: '#1001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    currency: 'USD',
    total_price: '50.00',
    financial_status: 'paid',
    fulfillment_status: null,
    line_items: [
        {
            id: 1,
            title: 'Test Product',
            quantity: 2,
            price: '25.00',
            product_id: 101,
            variant_id: 201,
        },
    ],
    customer: {
        id: 456,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        first_name: 'John',
        last_name: 'Doe',
        state: 'enabled',
        note: '',
        verified_email: true,
        multipass_identifier: null,
        tax_exempt: false,
        email: 'john@example.com',
        phone: '+1234567890',
        currency: 'USD',
        addresses: [],
        tax_exemptions: [],
        admin_graphql_api_id: 'gid://shopify/Customer/456',
        default_address: null,
        tags: '',
        metafields: [],
    },
}

const createMockOrder = (
    externalId: string,
    shopperIdentityId: string,
    orderData: Partial<OrderData> = {},
) =>
    mockEcommerceData({
        external_id: externalId,
        data: { ...mockOrderData, ...orderData },
        relationships: {
            shopper_identity: shopperIdentityId,
        },
    })

describe('useGetOrders', () => {
    it('returns loading state initially', () => {
        const mockHandler = mockListEcommerceDataHandler(async () =>
            HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: [createMockOrder('order-1', SHOPPER_IDENTITY_ID)],
                }),
            ),
        )
        server.use(mockHandler.handler)

        const { result } = renderHook(() =>
            useGetOrders({
                integrationId: 1,
                shopperIdentityId: SHOPPER_IDENTITY_ID,
            }),
        )

        expect(result.current.isLoadingOrders).toBe(true)
        expect(result.current.orders).toBeUndefined()
    })

    it('returns orders for the shopper from server', async () => {
        const mockHandler = mockListEcommerceDataHandler(async () =>
            HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: [
                        createMockOrder('order-1', SHOPPER_IDENTITY_ID, {
                            order_number: 1001,
                        }),
                        createMockOrder('order-3', SHOPPER_IDENTITY_ID, {
                            order_number: 1003,
                        }),
                    ],
                }),
            ),
        )
        server.use(mockHandler.handler)

        const { result } = renderHook(() =>
            useGetOrders({
                integrationId: 1,
                shopperIdentityId: SHOPPER_IDENTITY_ID,
            }),
        )

        await waitFor(() => {
            expect(result.current.isLoadingOrders).toBe(false)
        })

        expect(result.current.orders).toHaveLength(2)
        expect(result.current.orders?.[0].external_id).toBe('order-1')
        expect(result.current.orders?.[1].external_id).toBe('order-3')
    })

    it('passes shopper_identity_ids parameter to API', async () => {
        const mockHandler = mockListEcommerceDataHandler(async () =>
            HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: [createMockOrder('order-1', SHOPPER_IDENTITY_ID)],
                }),
            ),
        )
        server.use(mockHandler.handler)

        const waitForRequest = mockHandler.waitForRequest(server)

        renderHook(() =>
            useGetOrders({
                integrationId: 1,
                shopperIdentityId: SHOPPER_IDENTITY_ID,
            }),
        )

        await waitForRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('shopper_identity_ids')).toBe(
                SHOPPER_IDENTITY_ID,
            )
        })
    })

    it('returns empty array when server returns no orders', async () => {
        const mockHandler = mockListEcommerceDataHandler(async () =>
            HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: [],
                }),
            ),
        )
        server.use(mockHandler.handler)

        const { result } = renderHook(() =>
            useGetOrders({
                integrationId: 1,
                shopperIdentityId: SHOPPER_IDENTITY_ID,
            }),
        )

        await waitFor(() => {
            expect(result.current.isLoadingOrders).toBe(false)
        })

        expect(result.current.orders).toHaveLength(0)
    })

    it('returns all orders from server response', async () => {
        const orders = Array.from({ length: 10 }, (_, i) =>
            createMockOrder(`order-${i}`, SHOPPER_IDENTITY_ID),
        )

        const mockHandler = mockListEcommerceDataHandler(async () =>
            HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: orders,
                }),
            ),
        )
        server.use(mockHandler.handler)

        const { result } = renderHook(() =>
            useGetOrders({
                integrationId: 1,
                shopperIdentityId: SHOPPER_IDENTITY_ID,
            }),
        )

        await waitFor(() => {
            expect(result.current.isLoadingOrders).toBe(false)
        })

        expect(result.current.orders).toHaveLength(10)
    })

    it('does not fetch when integrationId is undefined', async () => {
        let requestMade = false
        const { handler } = mockListEcommerceDataHandler(async () => {
            requestMade = true
            return HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: [],
                }),
            )
        })
        server.use(handler)

        const { result } = renderHook(() =>
            useGetOrders({
                integrationId: undefined,
                shopperIdentityId: SHOPPER_IDENTITY_ID,
            }),
        )

        expect(result.current.orders).toBeUndefined()

        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(requestMade).toBe(false)
        expect(result.current.orders).toBeUndefined()
    })

    it('does not fetch when shopperIdentityId is undefined', async () => {
        let requestMade = false
        const { handler } = mockListEcommerceDataHandler(async () => {
            requestMade = true
            return HttpResponse.json(
                mockPaginatedDataEcommerceData({
                    data: [],
                }),
            )
        })
        server.use(handler)

        const { result } = renderHook(() =>
            useGetOrders({
                integrationId: 1,
                shopperIdentityId: undefined,
            }),
        )

        expect(result.current.orders).toBeUndefined()

        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(requestMade).toBe(false)
        expect(result.current.orders).toBeUndefined()
    })
})
