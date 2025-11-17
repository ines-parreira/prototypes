import type { Integration } from '@gorgias/helpdesk-queries'

import type { NewPhoneNumber } from 'models/phoneNumber/types'

import { getIntegrationName } from '../utils'

describe('getIntegrationName', () => {
    const mockPhoneNumbers: Record<number, NewPhoneNumber> = {
        1: {
            id: 1,
            phone_number_friendly: '+1 (555) 123-4567',
        } as NewPhoneNumber,
        2: {
            id: 2,
            phone_number_friendly: '+44 20 7123 4567',
        } as NewPhoneNumber,
    }

    it('should return empty string when integration is undefined', () => {
        const result = getIntegrationName(undefined, mockPhoneNumbers)
        expect(result).toBe('')
    })

    it('should return integration name when meta is undefined', () => {
        const integration = {
            name: 'SMS Integration',
        } as Integration

        const result = getIntegrationName(integration, mockPhoneNumbers)
        expect(result).toBe('SMS Integration')
    })

    it('should return integration name when phone_number_id is not a number', () => {
        const integration = {
            name: 'SMS Integration',
            meta: {
                phone_number_id: 'not-a-number',
            },
        } as unknown as Integration

        const result = getIntegrationName(integration, mockPhoneNumbers)
        expect(result).toBe('SMS Integration')
    })

    it('should return integration name when phone_number_id is null', () => {
        const integration = {
            name: 'SMS Integration',
            meta: {
                phone_number_id: null,
            },
        } as unknown as Integration

        const result = getIntegrationName(integration, mockPhoneNumbers)
        expect(result).toBe('SMS Integration')
    })

    it('should return integration name when phone number is not found in phoneNumbers', () => {
        const integration = {
            name: 'SMS Integration',
            meta: {
                phone_number_id: 999,
            },
        } as unknown as Integration

        const result = getIntegrationName(integration, mockPhoneNumbers)
        expect(result).toBe('SMS Integration')
    })

    it('should return integration name with phone number when phone number exists', () => {
        const integration = {
            name: 'SMS Integration',
            meta: {
                phone_number_id: 1,
            },
        } as unknown as Integration

        const result = getIntegrationName(integration, mockPhoneNumbers)
        expect(result).toBe('SMS Integration (+1 (555) 123-4567)')
    })

    it('should handle different phone number IDs correctly', () => {
        const integration = {
            name: 'Another SMS',
            meta: {
                phone_number_id: 2,
            },
        } as unknown as Integration

        const result = getIntegrationName(integration, mockPhoneNumbers)
        expect(result).toBe('Another SMS (+44 20 7123 4567)')
    })

    it('should handle empty phoneNumbers object', () => {
        const integration = {
            name: 'SMS Integration',
            meta: {
                phone_number_id: 1,
            },
        } as unknown as Integration

        const result = getIntegrationName(integration, {})
        expect(result).toBe('SMS Integration')
    })
})
