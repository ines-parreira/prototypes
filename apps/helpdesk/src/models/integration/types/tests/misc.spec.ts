import { Integration } from '..'
import { IntegrationType } from '../../constants'
import { isStoreIntegration } from '../misc'

describe('isStoreIntegration', () => {
    it.each([
        [IntegrationType.Shopify, 'Shopify'],
        [IntegrationType.Magento2, 'Magento2'],
        [IntegrationType.BigCommerce, 'BigCommerce'],
    ])('should return true for %s integration', (type, name) => {
        const integration = {
            id: 1,
            type,
            name: `Test ${name} Store`,
        } as Integration

        expect(isStoreIntegration(integration)).toBe(true)
    })

    it('should return false for non-store integrations', () => {
        const integration = {
            id: 4,
            type: IntegrationType.Email,
            name: 'Email Integration',
        } as Integration

        expect(isStoreIntegration(integration)).toBe(false)
    })
})
