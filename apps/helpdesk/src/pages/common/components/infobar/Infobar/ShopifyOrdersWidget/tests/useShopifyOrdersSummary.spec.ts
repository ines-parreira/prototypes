import { renderHook } from '@testing-library/react'

import type { Customer } from 'models/customer/types'

import { useShopifyOrdersSummary } from '../useShopifyOrdersSummary'

function createOrder(overrides: Record<string, any> = {}) {
    return {
        id: 1,
        name: '#1001',
        currency: 'USD',
        total_price: '50.00',
        financial_status: 'paid',
        fulfillment_status: null,
        line_items: [],
        note: '',
        tags: '',
        shipping_address: {},
        billing_address: {},
        discount_codes: [],
        shipping_lines: [],
        total_line_items_price: '50.00',
        total_discounts: '0',
        subtotal_price: '50.00',
        total_tax: '0',
        taxes_included: false,
        discount_applications: [],
        refunds: [],
        created_at: '2025-01-15T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z',
        ...overrides,
    }
}

function createCustomer(integrations: Record<string, any> = {}): Customer {
    return { integrations } as Customer
}

describe('useShopifyOrdersSummary', () => {
    it.each([
        ['customer is undefined', undefined],
        ['customer has no integrations', createCustomer({})],
        [
            'integration has no orders',
            createCustomer({
                '100': { __integration_type__: 'shopify', orders: [] },
            }),
        ],
    ])('should return empty state when %s', (_, customer) => {
        const { result } = renderHook(() =>
            useShopifyOrdersSummary(customer as Customer | undefined),
        )

        expect(result.current.lastOrder).toBeNull()
        expect(result.current.totalCount).toBe(0)
        expect(result.current.integrationOrders).toEqual([])
    })

    it('should return the most recent order as lastOrder', () => {
        const olderOrder = createOrder({
            id: 1,
            name: '#1001',
            created_at: '2025-01-01T00:00:00Z',
        })
        const newerOrder = createOrder({
            id: 2,
            name: '#1002',
            created_at: '2025-01-15T00:00:00Z',
        })

        const customer = createCustomer({
            '100': {
                __integration_type__: 'shopify',
                orders: [olderOrder, newerOrder],
            },
        })

        const { result } = renderHook(() => useShopifyOrdersSummary(customer))

        expect(result.current.lastOrder?.name).toBe('#1002')
        expect(result.current.totalCount).toBe(2)
        expect(result.current.integrationId).toBe(100)
        expect(result.current.integrationOrders).toHaveLength(2)
        expect(result.current.integrationOrders[0].name).toBe('#1002')
        expect(result.current.integrationOrders[1].name).toBe('#1001')
    })

    it('should count unfulfilled orders', () => {
        const fulfilledOrder = createOrder({
            id: 1,
            fulfillment_status: 'fulfilled',
            created_at: '2025-01-01T00:00:00Z',
        })
        const unfulfilledOrder = createOrder({
            id: 2,
            fulfillment_status: null,
            created_at: '2025-01-02T00:00:00Z',
        })
        const partialOrder = createOrder({
            id: 3,
            fulfillment_status: 'partial',
            created_at: '2025-01-03T00:00:00Z',
        })

        const customer = createCustomer({
            '100': {
                __integration_type__: 'shopify',
                orders: [fulfilledOrder, unfulfilledOrder, partialOrder],
            },
        })

        const { result } = renderHook(() => useShopifyOrdersSummary(customer))

        expect(result.current.totalCount).toBe(3)
        expect(result.current.unfulfilledCount).toBe(2)
    })

    it('should return the integration id of the most recent order across integrations', () => {
        const olderOrder = createOrder({
            id: 1,
            name: '#1001',
            created_at: '2025-01-01T00:00:00Z',
        })
        const newerOrder = createOrder({
            id: 2,
            name: '#1002',
            created_at: '2025-02-01T00:00:00Z',
        })

        const customer = createCustomer({
            '100': { __integration_type__: 'shopify', orders: [olderOrder] },
            '200': { __integration_type__: 'shopify', orders: [newerOrder] },
        })

        const { result } = renderHook(() => useShopifyOrdersSummary(customer))

        expect(result.current.lastOrder?.name).toBe('#1002')
        expect(result.current.integrationId).toBe(200)
        expect(result.current.totalCount).toBe(2)
        expect(result.current.integrationOrders).toHaveLength(1)
        expect(result.current.integrationOrders[0].name).toBe('#1002')
    })

    it('should skip non-shopify integrations', () => {
        const order = createOrder({ id: 1 })

        const customer = createCustomer({
            '100': { __integration_type__: 'other', orders: [order] },
        })

        const { result } = renderHook(() => useShopifyOrdersSummary(customer))

        expect(result.current.lastOrder).toBeNull()
        expect(result.current.totalCount).toBe(0)
        expect(result.current.integrationOrders).toEqual([])
    })

    it('should return integrationOrders only from the integration with the most recent order', () => {
        const orderA1 = createOrder({
            id: 1,
            name: '#A1',
            created_at: '2025-01-01T00:00:00Z',
        })
        const orderA2 = createOrder({
            id: 2,
            name: '#A2',
            created_at: '2025-01-05T00:00:00Z',
        })
        const orderB1 = createOrder({
            id: 3,
            name: '#B1',
            created_at: '2025-01-10T00:00:00Z',
        })
        const orderB2 = createOrder({
            id: 4,
            name: '#B2',
            created_at: '2025-01-15T00:00:00Z',
        })

        const customer = createCustomer({
            '100': {
                __integration_type__: 'shopify',
                orders: [orderA1, orderA2],
            },
            '200': {
                __integration_type__: 'shopify',
                orders: [orderB1, orderB2],
            },
        })

        const { result } = renderHook(() => useShopifyOrdersSummary(customer))

        expect(result.current.totalCount).toBe(4)
        expect(result.current.integrationId).toBe(200)
        expect(result.current.integrationOrders).toHaveLength(2)
        expect(result.current.integrationOrders[0].name).toBe('#B2')
        expect(result.current.integrationOrders[1].name).toBe('#B1')
    })
})
