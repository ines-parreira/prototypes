import { IntegrationType } from 'models/integration/constants'
import type { Integration } from 'models/integration/types'

import determineChannelLink from '../determineChannelLink'

describe('determineChannelLink', () => {
    const baseIntegration = {
        id: 123,
    }

    it('should return correct link for email channel', () => {
        const emailChannel = {
            ...baseIntegration,
            type: IntegrationType.Email,
        } as Integration
        expect(determineChannelLink(emailChannel)).toBe(
            '/app/settings/channels/email/123',
        )
    })

    it('should return correct link for chat channel', () => {
        const chatChannel = {
            ...baseIntegration,
            type: IntegrationType.GorgiasChat,
        } as Integration
        expect(determineChannelLink(chatChannel)).toBe(
            '/app/settings/channels/gorgias_chat/123',
        )
    })

    it('should return correct link for TikTok channel', () => {
        const tiktokChannel = {
            ...baseIntegration,
            application_id: '653a626236234a4ec85eca67',
            type: IntegrationType.App,
            meta: {
                address: '123123',
            },
        } as Integration
        expect(determineChannelLink(tiktokChannel)).toBe(
            '/app/settings/integrations/app/653a626236234a4ec85eca67/connections',
        )
    })

    it('should return correct link for SMS channel', () => {
        const smsChannel = {
            ...baseIntegration,
            type: IntegrationType.Sms,
        } as unknown as Integration
        expect(determineChannelLink(smsChannel)).toBe(
            '/app/settings/channels/sms/123/preferences',
        )
    })

    it('should return correct link for Facebook channel', () => {
        const facebookChannel = {
            ...baseIntegration,
            type: IntegrationType.Facebook,
        } as Integration
        expect(determineChannelLink(facebookChannel)).toBe(
            '/app/settings/integrations/facebook/123/overview',
        )
    })

    it('should return correct link for phone channel', () => {
        const phoneChannel = {
            ...baseIntegration,
            type: IntegrationType.Phone,
        } as unknown as Integration
        expect(determineChannelLink(phoneChannel)).toBe(
            '/app/settings/channels/phone/123/preferences',
        )
    })

    it('should return correct link for Aircall channel', () => {
        const aircallChannel = {
            ...baseIntegration,
            type: IntegrationType.Aircall,
        } as Integration
        expect(determineChannelLink(aircallChannel)).toBe(
            '/app/settings/integrations/aircall',
        )
    })

    it('should return correct link for WhatsApp channel', () => {
        const whatsappChannel = {
            ...baseIntegration,
            type: IntegrationType.WhatsApp,
        } as Integration
        expect(determineChannelLink(whatsappChannel)).toBe(
            '/app/settings/integrations/whatsapp/123/preferences',
        )
    })

    it('should return default link for unknown channel type', () => {
        const unknownChannel = {
            ...baseIntegration,
            type: IntegrationType.App,
            meta: {
                address: 'unknown-channel',
            },
        } as Integration
        expect(determineChannelLink(unknownChannel)).toBe(
            '/settings/integrations/app/123',
        )
    })
})
