import type { TicketCustomer } from '@gorgias/helpdesk-queries'

import { getShopifyCustomerAssociations } from '../getShopifyCustomerAssociations'

function makeCustomer(integrations: Record<string, unknown>): TicketCustomer {
    return { integrations } as unknown as TicketCustomer
}

describe('getShopifyCustomerAssociations', () => {
    it('returns empty associations for a null customer', () => {
        const { associatedShopifyCustomerIds, externalIdMap } =
            getShopifyCustomerAssociations(null)

        expect(associatedShopifyCustomerIds.size).toBe(0)
        expect(externalIdMap.size).toBe(0)
    })

    it('collects Shopify integration ids and maps external customer ids', () => {
        const customer = makeCustomer({
            '1': { __integration_type__: 'shopify', customer: { id: 456 } },
            '2': { __integration_type__: 'shopify', customer: { id: 789 } },
        })

        const { associatedShopifyCustomerIds, externalIdMap } =
            getShopifyCustomerAssociations(customer)

        expect([...associatedShopifyCustomerIds]).toEqual([1, 2])
        expect(externalIdMap.get(1)).toBe('456')
        expect(externalIdMap.get(2)).toBe('789')
    })

    it('ignores non-Shopify integrations', () => {
        const customer = makeCustomer({
            '1': { __integration_type__: 'shopify', customer: { id: 456 } },
            '2': { __integration_type__: 'recharge', customer: { id: 789 } },
        })

        const { associatedShopifyCustomerIds, externalIdMap } =
            getShopifyCustomerAssociations(customer)

        expect([...associatedShopifyCustomerIds]).toEqual([1])
        expect(externalIdMap.has(2)).toBe(false)
    })

    it('skips integrations without a numeric id key', () => {
        const customer = makeCustomer({
            shopify: { __integration_type__: 'shopify', customer: { id: 456 } },
        })

        const { associatedShopifyCustomerIds } =
            getShopifyCustomerAssociations(customer)

        expect(associatedShopifyCustomerIds.size).toBe(0)
    })

    it('omits the external id when the integration has no customer id', () => {
        const customer = makeCustomer({
            '1': { __integration_type__: 'shopify' },
        })

        const { associatedShopifyCustomerIds, externalIdMap } =
            getShopifyCustomerAssociations(customer)

        expect([...associatedShopifyCustomerIds]).toEqual([1])
        expect(externalIdMap.has(1)).toBe(false)
    })
})
