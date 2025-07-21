import { Integration, IntegrationType } from 'models/integration/types'

import getEligibleChannels from '../getEligibleChannel'

describe('getEligibleChannels', () => {
    const mockIntegrations: Integration[] = [
        { id: 1, type: IntegrationType.Email, name: 'Email' } as Integration,
        {
            id: 2,
            type: IntegrationType.GorgiasChat,
            name: 'Chat',
        } as Integration,
        { id: 3, type: IntegrationType.Phone, name: 'Phone' } as Integration,
        { id: 4, type: IntegrationType.Sms, name: 'SMS' } as Integration,
        {
            id: 5,
            type: IntegrationType.WhatsApp,
            name: 'WhatsApp',
        } as Integration,
        {
            id: 6,
            type: IntegrationType.Facebook,
            name: 'Facebook',
        } as Integration,
        { id: 7, name: 'Other' } as Integration,
    ]

    it('should filter eligible channels', () => {
        const result = getEligibleChannels(mockIntegrations)
        expect(result).toHaveLength(6)
        expect(result.map((i) => i.type)).toEqual([
            IntegrationType.Email,
            IntegrationType.GorgiasChat,
            IntegrationType.Phone,
            IntegrationType.Sms,
            IntegrationType.WhatsApp,
            IntegrationType.Facebook,
        ])
    })

    it('should handle empty integrations array', () => {
        const result = getEligibleChannels([])
        expect(result).toEqual([])
    })

    it('should handle undefined input', () => {
        const result = getEligibleChannels(
            undefined as unknown as Integration[],
        )
        expect(result).toEqual([])
    })
})
