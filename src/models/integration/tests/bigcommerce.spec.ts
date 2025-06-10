import {
    Integration,
    IntegrationType,
    isBigCommerceIntegration,
} from '../types'

describe('bigcommerce', () => {
    it('should return true for bigCommerce integration', () => {
        const mockIntegration = {
            id: 1,
            type: IntegrationType.BigCommerce,
            name: 'BigCommerce Store',
        } as Integration

        expect(isBigCommerceIntegration(mockIntegration)).toBe(true)
    })
    it('should return false for non bigCommerce integration', () => {
        const mockIntegration = {
            id: 1,
            type: IntegrationType.Shopify,
            name: 'BigCommerce Store',
        } as Integration

        expect(isBigCommerceIntegration(mockIntegration)).toBe(false)
    })
})
