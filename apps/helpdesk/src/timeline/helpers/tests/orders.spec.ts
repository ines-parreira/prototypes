import { Customer } from 'models/customer/types'

import { extractOrders } from '../orders'

describe('extractOrders', () => {
    it('should extract supported integratin orders from customer', () => {
        const customer = {
            integrations: {
                shopify: {
                    orders: [{ id: 1 }, { id: 2 }],
                    __integration_type__: 'shopify',
                },
            },
        } as unknown as Customer

        const orders = extractOrders(customer)
        expect(orders).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return empty array if customer has no supported integrations', () => {
        const customer = {
            integrations: {
                random: {
                    orders: [{ id: 1 }, { id: 2 }],
                },
            },
        } as unknown as Customer

        const orders = extractOrders(customer)
        expect(orders).toEqual([])
    })

    it('should return empty array if customer has no integrations', () => {
        const customer = {
            integrations: {},
        } as unknown as Customer

        const orders = extractOrders(customer)
        expect(orders).toEqual([])
    })
})
