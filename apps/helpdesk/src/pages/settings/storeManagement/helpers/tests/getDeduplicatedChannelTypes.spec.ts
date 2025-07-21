import { IntegrationType } from 'models/integration/constants'
import { Integration } from 'models/integration/types'

import deduplicateChannelTypes from '../getDeduplicatedChannelTypes'

describe('deduplicateChannelTypes', () => {
    it('should return empty array when no channels provided', () => {
        const result = deduplicateChannelTypes([])
        expect(result).toEqual([])
    })

    it('should return unique channel types', () => {
        const channels: Integration[] = [
            { type: IntegrationType.Email, id: 1 } as Integration,
            { type: IntegrationType.Gmail, id: 1 } as Integration,
            { type: IntegrationType.Outlook, id: 1 } as Integration,
            { type: IntegrationType.Sms, id: 2 } as Integration,
            { type: IntegrationType.Phone, id: 2 } as Integration,
            { type: IntegrationType.Aircall, id: 2 } as Integration,

            { type: IntegrationType.Email, id: 3 } as Integration,
            { type: IntegrationType.GorgiasChat, id: 4 } as Integration,
            { type: IntegrationType.Sms, id: 5 } as Integration,
        ]

        const result = deduplicateChannelTypes(channels)
        expect(result).toEqual([
            IntegrationType.Email,
            IntegrationType.Sms,
            IntegrationType.Phone,
            IntegrationType.GorgiasChat,
        ])
    })
})
