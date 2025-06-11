import { IntegrationType, StoreIntegration } from 'models/integration/types'

import getStoreTypeName from '../getStoreTypeName'

describe('getStoreTypeName', () => {
    it('returns Shopify for Shopify integration', () => {
        const integration: Partial<StoreIntegration> = {
            type: IntegrationType.Shopify,
        }
        expect(getStoreTypeName(integration as StoreIntegration)).toBe(
            'Shopify',
        )
    })

    it('returns Magento 2 for Magento2 integration', () => {
        const integration: Partial<StoreIntegration> = {
            type: IntegrationType.Magento2,
        }
        expect(getStoreTypeName(integration as StoreIntegration)).toBe(
            'Magento 2',
        )
    })

    it('returns BigCommerce for BigCommerce integration', () => {
        const integration: Partial<StoreIntegration> = {
            type: IntegrationType.BigCommerce,
        }
        expect(getStoreTypeName(integration as StoreIntegration)).toBe(
            'BigCommerce',
        )
    })

    it('returns empty string for null integration', () => {
        expect(getStoreTypeName(null)).toBe('')
    })

    it('returns empty string for undefined integration', () => {
        expect(getStoreTypeName(undefined)).toBe('')
    })
})
