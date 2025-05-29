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
})
