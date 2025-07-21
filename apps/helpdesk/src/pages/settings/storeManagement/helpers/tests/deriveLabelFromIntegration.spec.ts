import { IntegrationType } from 'models/integration/constants'
import { Integration } from 'models/integration/types'

import deriveLabelFromIntegration from '../deriveLabelFromIntegration'

describe('deriveLabelFromIntegration', () => {
    it('should return meta.address when address exists in meta', () => {
        const mockIntegration = {
            id: 1,
            name: 'Test Email',
            type: IntegrationType.Email,
            meta: {
                address: 'test@example.com',
            },
        } as Integration

        const result = deriveLabelFromIntegration(mockIntegration)
        expect(result).toBe('test@example.com')
    })

    it('should return integration name when address does not exist in meta', () => {
        const mockIntegration = {
            id: 1,
            name: 'Test Facebook',
            type: IntegrationType.Facebook,
            meta: {},
        } as Integration

        const result = deriveLabelFromIntegration(mockIntegration)
        expect(result).toBe('Test Facebook')
    })

    it('should return integration name for help center channel', () => {
        const mockIntegration = {
            id: 1,
            name: 'Help Center',
            type: IntegrationType.App,
            meta: {
                address: 'help-center|1234',
            },
        } as Integration

        const result = deriveLabelFromIntegration(mockIntegration)
        expect(result).toBe('Help Center')
    })
    it('should return integration name for contact form channel', () => {
        const mockIntegration = {
            id: 1,
            name: 'Contact Form',
            type: IntegrationType.App,
            meta: {
                address: 'contact-form|1234',
            },
        } as Integration

        const result = deriveLabelFromIntegration(mockIntegration)
        expect(result).toBe('Contact Form')
    })
})
