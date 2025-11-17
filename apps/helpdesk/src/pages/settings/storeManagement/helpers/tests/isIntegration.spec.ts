import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'

import {
    isChatChannel,
    isContactFormChannel,
    isEmailChannel,
    isFacebookChannel,
    isHelpCenterChannel,
    isSmsChannel,
    isTikTokChannel,
    isVoiceChannel,
    isWhatsAppChannel,
} from '../isIntegration'

describe('isIntegration helpers', () => {
    describe('isEmailChannel', () => {
        it('should return true for email type integrations', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            const gmailIntegration = {
                type: IntegrationType.Gmail,
            } as Integration
            const outlookIntegration = {
                type: IntegrationType.Outlook,
            } as Integration

            expect(isEmailChannel(emailIntegration)).toBe(true)
            expect(isEmailChannel(gmailIntegration)).toBe(true)
            expect(isEmailChannel(outlookIntegration)).toBe(true)
        })

        it('should return false for non-email type integrations', () => {
            const chatIntegration = {
                type: IntegrationType.GorgiasChat,
            } as Integration
            expect(isEmailChannel(chatIntegration)).toBe(false)
        })
    })

    describe('isChatChannel', () => {
        it('should return true for Gorgias chat integration', () => {
            const chatIntegration = {
                type: IntegrationType.GorgiasChat,
            } as Integration
            expect(isChatChannel(chatIntegration)).toBe(true)
        })

        it('should return false for non-chat integrations', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            expect(isChatChannel(emailIntegration)).toBe(false)
        })
    })

    describe('isVoiceChannel', () => {
        it('should return true for voice type integrations', () => {
            const phoneIntegration = {
                type: IntegrationType.Phone,
            } as Integration
            const aircallIntegration = {
                type: IntegrationType.Aircall,
            } as Integration

            expect(isVoiceChannel(phoneIntegration)).toBe(true)
            expect(isVoiceChannel(aircallIntegration)).toBe(true)
        })

        it('should return false for non-voice integrations', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            expect(isVoiceChannel(emailIntegration)).toBe(false)
        })
    })

    describe('isSmsChannel', () => {
        it('should return true for SMS integration', () => {
            const smsIntegration = { type: IntegrationType.Sms } as Integration
            expect(isSmsChannel(smsIntegration)).toBe(true)
        })

        it('should return false for non-SMS integrations', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            expect(isSmsChannel(emailIntegration)).toBe(false)
        })
    })

    describe('isContactFormChannel', () => {
        it('should return true for contact-form channels', () => {
            const contactFormIntegration = {
                type: IntegrationType.App,
                meta: { address: 'contact-form-something' },
            } as Integration
            expect(isContactFormChannel(contactFormIntegration)).toBe(true)
        })

        it('should return false for non contact form channels', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            const appIntegration = {
                type: IntegrationType.App,
                meta: { address: 'other-address' },
            } as Integration

            expect(isContactFormChannel(emailIntegration)).toBe(false)
            expect(isContactFormChannel(appIntegration)).toBe(false)
        })
    })

    describe('isHelpCenterChannel', () => {
        it('should return true for help center channel', () => {
            const helpCenterIntegration = {
                type: IntegrationType.App,
                meta: { address: 'help-center-something' },
            } as Integration
            expect(isHelpCenterChannel(helpCenterIntegration)).toBe(true)
        })

        it('should return false for non help-center channel', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            const appIntegration = {
                type: IntegrationType.App,
                meta: { address: 'other-address' },
            } as Integration

            expect(isHelpCenterChannel(emailIntegration)).toBe(false)
            expect(isHelpCenterChannel(appIntegration)).toBe(false)
        })
    })

    describe('isWhatsAppChannel', () => {
        it('should return true for WhatsApp integration', () => {
            const whatsappIntegration = {
                type: IntegrationType.WhatsApp,
            } as Integration
            expect(isWhatsAppChannel(whatsappIntegration)).toBe(true)
        })

        it('should return false for non-WhatsApp integrations', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            expect(isWhatsAppChannel(emailIntegration)).toBe(false)
        })
    })

    describe('isFacebookChannel', () => {
        it('should return true for Facebook integration', () => {
            const facebookIntegration = {
                type: IntegrationType.Facebook,
            } as Integration
            expect(isFacebookChannel(facebookIntegration)).toBe(true)
        })

        it('should return false for non-Facebook integrations', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            expect(isFacebookChannel(emailIntegration)).toBe(false)
        })
    })

    describe('isTikTokChannel', () => {
        it('should return true for TikTok integration', () => {
            const tiktokIntegration = {
                type: IntegrationType.App,
                application_id: '653a626236234a4ec85eca67',
            } as Integration
            expect(isTikTokChannel(tiktokIntegration)).toBe(true)
        })

        it('should return false for non-TikTok integrations', () => {
            const emailIntegration = {
                type: IntegrationType.Email,
            } as Integration
            const appIntegration = {
                type: IntegrationType.App,
                application_id: 'different-id',
            } as Integration

            expect(isTikTokChannel(emailIntegration)).toBe(false)
            expect(isTikTokChannel(appIntegration)).toBe(false)
        })
    })
})
