import { Integration, IntegrationType } from 'models/integration/types'

import { ChannelTypes } from '../../types'
import integrationBelongsToChannel from '../integrationBelongsToChannel'

describe('integrationBelongsToChannel', () => {
    const createIntegration = (type: IntegrationType, rest = {}): Integration =>
        ({
            type,
            id: 1,
            name: 'Test Integration',
            ...rest,
        }) as Integration

    describe('email channel', () => {
        it('should return true for email type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            const gmailIntegration = createIntegration(IntegrationType.Gmail)
            const outlookIntegration = createIntegration(
                IntegrationType.Outlook,
            )

            expect(integrationBelongsToChannel(emailIntegration, 'email')).toBe(
                true,
            )
            expect(integrationBelongsToChannel(gmailIntegration, 'email')).toBe(
                true,
            )
            expect(
                integrationBelongsToChannel(outlookIntegration, 'email'),
            ).toBe(true)
        })

        it('should return false for non-email type integrations', () => {
            const chatIntegration = createIntegration(
                IntegrationType.GorgiasChat,
            )
            expect(integrationBelongsToChannel(chatIntegration, 'email')).toBe(
                false,
            )
        })
    })

    describe('chat channel', () => {
        it('should return true for chat type integrations', () => {
            const chatIntegration = createIntegration(
                IntegrationType.GorgiasChat,
            )
            expect(integrationBelongsToChannel(chatIntegration, 'chat')).toBe(
                true,
            )
        })

        it('should return false for non-chat type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(integrationBelongsToChannel(emailIntegration, 'chat')).toBe(
                false,
            )
        })
    })

    describe('help center channel', () => {
        it('should return true for help center type integrations', () => {
            const helpCenterIntegration = createIntegration(
                IntegrationType.App,
                {
                    meta: {
                        address: 'help-center',
                    },
                },
            )
            expect(
                integrationBelongsToChannel(
                    helpCenterIntegration,
                    'helpCenter',
                ),
            ).toBe(true)
        })

        it('should return false for non-help center type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(
                integrationBelongsToChannel(emailIntegration, 'helpCenter'),
            ).toBe(false)
        })
    })

    describe('contact form channel', () => {
        it('should return true for contact form type integrations', () => {
            const contactFormIntegration = createIntegration(
                IntegrationType.App,
                {
                    meta: {
                        address: 'contact-form',
                    },
                },
            )
            expect(
                integrationBelongsToChannel(
                    contactFormIntegration,
                    'contactForm',
                ),
            ).toBe(true)
        })

        it('should return false for non-contact form type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(
                integrationBelongsToChannel(emailIntegration, 'contactForm'),
            ).toBe(false)
        })
    })

    describe('voice channel', () => {
        it('should return true for voice type integrations', () => {
            const phoneIntegration = createIntegration(IntegrationType.Phone)
            const aircallIntegration = createIntegration(
                IntegrationType.Aircall,
            )

            expect(integrationBelongsToChannel(phoneIntegration, 'voice')).toBe(
                true,
            )
            expect(
                integrationBelongsToChannel(aircallIntegration, 'voice'),
            ).toBe(true)
        })

        it('should return false for non-voice type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(integrationBelongsToChannel(emailIntegration, 'voice')).toBe(
                false,
            )
        })
    })

    describe('sms channel', () => {
        it('should return true for SMS type integrations', () => {
            const smsIntegration = createIntegration(IntegrationType.Sms)
            expect(integrationBelongsToChannel(smsIntegration, 'sms')).toBe(
                true,
            )
        })

        it('should return false for non-SMS type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(integrationBelongsToChannel(emailIntegration, 'sms')).toBe(
                false,
            )
        })
    })

    describe('whatsApp channel', () => {
        it('should return true for WhatsApp type integrations', () => {
            const whatsAppIntegration = createIntegration(
                IntegrationType.WhatsApp,
            )
            expect(
                integrationBelongsToChannel(whatsAppIntegration, 'whatsApp'),
            ).toBe(true)
        })

        it('should return false for non-WhatsApp type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(
                integrationBelongsToChannel(emailIntegration, 'whatsApp'),
            ).toBe(false)
        })
    })

    describe('facebook channel', () => {
        it('should return true for Facebook type integrations', () => {
            const facebookIntegration = createIntegration(
                IntegrationType.Facebook,
            )
            expect(
                integrationBelongsToChannel(facebookIntegration, 'facebook'),
            ).toBe(true)
        })

        it('should return false for non-Facebook type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(
                integrationBelongsToChannel(emailIntegration, 'facebook'),
            ).toBe(false)
        })
    })

    describe('tiktokShop channel', () => {
        it('should return true for TikTok Shop type integrations', () => {
            const tiktokIntegration = createIntegration(IntegrationType.App, {
                application_id: '653a626236234a4ec85eca67',
            })
            expect(
                integrationBelongsToChannel(tiktokIntegration, 'tiktokShop'),
            ).toBe(true)
        })

        it('should return false for non-TikTok Shop type integrations', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(
                integrationBelongsToChannel(emailIntegration, 'tiktokShop'),
            ).toBe(false)
        })
    })

    describe('unknown channel', () => {
        it('should return false for unknown channel types', () => {
            const emailIntegration = createIntegration(IntegrationType.Email)
            expect(
                integrationBelongsToChannel(
                    emailIntegration,
                    'unknown' as ChannelTypes,
                ),
            ).toBe(false)
        })
    })
})
