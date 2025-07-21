import { IntegrationType } from 'models/integration/constants'
import { Integration } from 'models/integration/types'

import sortChannels from '../sortChannels'

const emailIntegration = {
    type: IntegrationType.Email,
    meta: {},
} as Integration
const gmailIntegration = {
    type: IntegrationType.Gmail,
    meta: {},
}
const outlookIntegration = {
    type: IntegrationType.Outlook,
    meta: {},
}
const aircallIntegration = {
    type: IntegrationType.Aircall,
    meta: {},
}
const smsIntegration = {
    type: IntegrationType.Sms,
    meta: {},
}
const gorgiasChatIntegration = {
    type: IntegrationType.GorgiasChat,
    meta: {},
}
const phoneIntegration = {
    type: IntegrationType.Phone,
    meta: {},
}
const facebookIntegration = {
    type: IntegrationType.Facebook,
    meta: {},
}
const whatsappIntegration = {
    type: IntegrationType.WhatsApp,
    meta: {},
}
const tiktokIntegration = {
    type: IntegrationType.App,
    meta: {},
    application_id: '653a626236234a4ec85eca67',
}
const contactFormIntegration = {
    type: IntegrationType.App,
    meta: {
        address: 'contact-form',
    },
}
const helpCenterIntegration = {
    type: IntegrationType.App,
    meta: {
        address: 'help-center',
    },
}

describe('sortChannels', () => {
    it('should sort channels according to predefined order', () => {
        const unsortedChannels = [
            whatsappIntegration,
            emailIntegration,
            tiktokIntegration,
            facebookIntegration,
            gorgiasChatIntegration,
            phoneIntegration,
            aircallIntegration,
            helpCenterIntegration,
            contactFormIntegration,
            gmailIntegration,
            outlookIntegration,
            smsIntegration,
        ]

        const sortedChannels = sortChannels(unsortedChannels as Integration[])

        expect(sortedChannels).toEqual([
            emailIntegration,
            gmailIntegration,
            outlookIntegration,
            gorgiasChatIntegration,
            helpCenterIntegration,
            contactFormIntegration,
            phoneIntegration,
            aircallIntegration,
            smsIntegration,
            whatsappIntegration,
            facebookIntegration,
            tiktokIntegration,
        ])
    })

    it('should return empty array when input is empty', () => {
        const result = sortChannels([])
        expect(result).toEqual([])
    })
})
