import {channelsQueryKeys as mockChannelsQueryKeys} from 'models/channel/queries'
import {channels as mockChannels} from 'fixtures/channels'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    getChannelById,
    getChannelBySlug,
    getChannels,
    isChannel,
    isLegacyChannel,
    isNewChannel,
    toChannel,
} from 'services/channels'
import {IntegrationType} from 'models/integration/constants'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [[mockChannelsQueryKeys.list(), mockChannels]],
    }),
}))

describe('services', () => {
    describe('channels', () => {
        describe('getChannels()', () => {
            it('should return an array of channels', () => {
                const channels = getChannels()
                expect(channels).toBeInstanceOf(Array)
                expect(channels).toHaveLength(mockChannels.length)
            })
        })

        describe('getChannelById()', () => {
            it('should return a channel if given a valid ID', () => {
                expect(
                    getChannelById('4a2c595c-99b8-45d4-a6b2-a8541538aab0')
                ).toBeDefined()
            })

            it('should return undefined for invalid inputs', () => {
                expect(getChannelById('invalid')).toBeUndefined()
            })
        })

        describe('getChannelBySlug()', () => {
            it('should return a channel if given a valid slug', () => {
                expect(getChannelBySlug('email')).toBeDefined()
            })

            it('should allow for a wider range of input types', () => {
                expect(getChannelBySlug(TicketChannel.Email)).toBeDefined()
                expect(getChannelBySlug(IntegrationType.Sms)).toBeDefined()
                expect(
                    getChannelBySlug(TicketMessageSourceType.Chat)
                ).toBeDefined()
            })

            it('should return undefined for invalid inputs', () => {
                expect(getChannelBySlug('invalid')).toBeUndefined()
            })
        })

        describe('isChannel()', () => {
            it('should return true for valid channels', () => {
                expect(isChannel(getChannelBySlug('email'))).toBe(true)
                expect(isChannel(getChannelBySlug('tiktok-shop'))).toBe(true)
                expect(
                    isChannel({
                        id: '123',
                        slug: 'some-channel',
                        name: 'Some Channel',
                    })
                ).toBe(true)
            })

            it('should return false for partial/invalid channels', () => {
                expect(isChannel('email')).toBe(false)
                expect(isChannel('tiktok-shop')).toBe(false)
                expect(isChannel(TicketMessageSourceType.Email)).toBe(false)
                expect(isChannel(TicketChannel.Email)).toBe(false)
                expect(isChannel(null)).toBe(false)
                expect(isChannel(undefined)).toBe(false)
                expect(isChannel({id: 123, slug: 'x'})).toBe(false)
                expect(isChannel({slug: 'x'})).toBe(false)
                expect(isChannel('123')).toBe(false)
            })
        })

        describe('isLegacyChannel()', () => {
            it('should return true for legacy channels', () => {
                expect(isLegacyChannel('email')).toBe(true)
                expect(isLegacyChannel(IntegrationType.Sms)).toBe(true)
                expect(isLegacyChannel(TicketChannel.FacebookMention)).toBe(
                    true
                )
                expect(
                    isLegacyChannel(TicketMessageSourceType.FacebookMessenger)
                ).toBe(true)
                expect(
                    isLegacyChannel(TicketMessageSourceType.WhatsAppMessage)
                ).toBe(true)
                expect(isLegacyChannel(getChannelBySlug('whatsapp')!)).toBe(
                    true
                )
            })

            it('should return false for new channels', () => {
                expect(isLegacyChannel('tiktok-shop')).toBe(false)
                expect(isLegacyChannel(getChannelBySlug('tiktok-shop')!)).toBe(
                    false
                )
            })

            it('should return false for invalid channels', () => {
                expect(isLegacyChannel('not-a-valid-channel')).toBe(false)
            })
        })

        describe('isNewChannel()', () => {
            it('should return false for legacy channels', () => {
                expect(isNewChannel('email')).toBe(false)
                expect(isNewChannel(IntegrationType.Sms)).toBe(false)
                expect(isNewChannel(TicketChannel.FacebookMention)).toBe(false)
                expect(
                    isNewChannel(TicketMessageSourceType.FacebookMessenger)
                ).toBe(false)
                expect(
                    isNewChannel(TicketMessageSourceType.WhatsAppMessage)
                ).toBe(false)
                expect(isNewChannel(getChannelBySlug('whatsapp')!)).toBe(false)
            })

            it('should return true for new channels', () => {
                expect(isNewChannel('tiktok-shop')).toBe(true)
                expect(isNewChannel('google-business-messenger')).toBe(true)
                expect(isNewChannel(toChannel('tiktok-shop')!)).toBe(true)
                expect(isNewChannel(getChannelBySlug('tiktok-shop')!)).toBe(
                    true
                )
            })

            it('should return false for invalid channels', () => {
                expect(isNewChannel('not-a-valid-channel')).toBe(false)
            })
        })

        describe('toChannel()', () => {
            it('should return a full channel payload', () => {
                expect(toChannel('email')).toEqual({
                    id: 'b7fbed27-5dda-44df-a967-18e3d3bcdf00',
                    live_messaging: false,
                    logo_url:
                        'https://gorgias-assets.gorgias.io/static/public/img/email.svg',
                    name: 'Email',
                    slug: 'email',
                    created_datetime: '2023-06-19T14:42:42.424242+00:00',
                    updated_datetime: '2023-06-19T14:42:42.424242+00:00',
                })
            })

            it('should return a channel if given a valid slug (in any form)', () => {
                expect(toChannel(TicketChannel.Email)).toBeDefined()
                expect(toChannel(IntegrationType.Sms)).toBeDefined()
                expect(toChannel(TicketMessageSourceType.Chat)).toBeDefined()
                expect(toChannel('aircall')).toBeDefined()
            })

            it('should return the channel if given a channel', () => {
                const channel = getChannelBySlug('email')
                expect(toChannel(channel!)).toBe(channel)
            })

            it('should try to convert a source type > ticket channel > channel', () => {
                const channel = getChannelBySlug('facebook-recommendations')
                expect(
                    toChannel(TicketMessageSourceType.FacebookReviewComment)
                ).toBe(channel)
            })

            it('should return undefined for invalid input', () => {
                expect(toChannel('invalid')).toBeUndefined()
                expect(toChannel(undefined!)).toBeUndefined()
                expect(toChannel(null!)).toBeUndefined()
            })
        })
    })
})
