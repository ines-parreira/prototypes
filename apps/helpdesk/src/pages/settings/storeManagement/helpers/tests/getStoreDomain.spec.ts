import { IntegrationType } from 'models/integration/constants'
import { StoreIntegration } from 'models/integration/types'

import getStoreDomain from '../getStoreDomain'

describe('getStoreDomain', () => {
    it('should return store_url for Magento2 stores', () => {
        const store = {
            type: IntegrationType.Magento2,
            meta: { store_url: 'https://magento-store.com' },
        } as StoreIntegration

        expect(getStoreDomain(store)).toBe('https://magento-store.com')
    })

    it('should return shop_domain for Shopify stores', () => {
        const store = {
            type: IntegrationType.Shopify,
            meta: { shop_domain: 'my-shop.myshopify.com' },
        } as StoreIntegration

        expect(getStoreDomain(store)).toBe('my-shop.myshopify.com')
    })

    it('should return shop_domain for BigCommerce stores', () => {
        const store = {
            type: IntegrationType.BigCommerce,
            meta: { shop_domain: 'store.mybigcommerce.com' },
        } as StoreIntegration

        expect(getStoreDomain(store)).toBe('store.mybigcommerce.com')
    })

    it('should return null for unknown store types', () => {
        const store = {
            meta: { shop_domain: 'domain.com' },
        } as StoreIntegration

        expect(getStoreDomain(store)).toBeNull()
    })

    it('should handle missing meta data', () => {
        const store = {
            type: IntegrationType.Shopify,
        } as StoreIntegration

        expect(getStoreDomain(store)).toBeUndefined()
    })
})
