import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from 'business/types/ticket'
import { TicketMessage } from 'models/ticket/types'
import { DEFAULT_CHANNEL } from 'tickets/common/config'

import sourceTypeToChannel from '../sourceTypeToChannel'

describe('sourceTypeToChannel()', () => {
    it('should return the default channel if there is no source type', () => {
        const channel = sourceTypeToChannel(
            null as unknown as TicketMessageSourceType,
            [],
        )
        expect(channel).toBe(DEFAULT_CHANNEL)
    })

    it('should return the default channel if there is no message and source type is internal note', () => {
        const channel = sourceTypeToChannel(
            TicketMessageSourceType.InternalNote,
            [],
        )
        expect(channel).toBe(DEFAULT_CHANNEL)
    })

    it('should return the phone channel if the last not system message is from twilio', () => {
        const channel = sourceTypeToChannel(
            TicketMessageSourceType.InternalNote,
            [{ via: TicketVia.Twilio } as TicketMessage],
        )
        expect(channel).toBe(TicketChannel.Phone)
    })

    it('should return the InternalNote if the last message channel is not a legacy channel', () => {
        const channel = sourceTypeToChannel(
            TicketMessageSourceType.InternalNote,
            [{ channel: 'tiktok-shop' } as unknown as TicketMessage],
        )
        expect(channel).toBe(TicketChannel.InternalNote)
    })

    it.each([
        TicketMessageSourceType.FacebookMentionPost,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        'should return the FacebookMention channel if the last not system message is from a Facebook Mention Post or Comment',
        (sourceType) => {
            const channel = sourceTypeToChannel(sourceType, [
                { via: TicketVia.Facebook } as TicketMessage,
            ])
            expect(channel).toBe(TicketChannel.FacebookMention)
        },
    )

    it.each([
        TicketMessageSourceType.TwitterTweet,
        TicketMessageSourceType.TwitterQuotedTweet,
        TicketMessageSourceType.TwitterMentionTweet,
    ])(
        'should return Twitter channel if the last not system message is from a Twitter Tweet or Quoted Tweet',
        (sourceType) => {
            const channel = sourceTypeToChannel(sourceType, [
                { via: TicketVia.Twitter } as TicketMessage,
            ])
            expect(channel).toBe(TicketChannel.Twitter)
        },
    )

    it.each([
        TicketMessageSourceType.ChatContactForm,
        TicketMessageSourceType.HelpCenterContactForm,
    ])(
        'should return Email channel if the last non system message is from a contact form source type',
        (sourceType) => {
            const channel =
                sourceType === TicketMessageSourceType.ChatContactForm
                    ? TicketChannel.Chat
                    : TicketChannel.HelpCenter

            const via = TicketVia.ContactForm

            const calculatedChannel = sourceTypeToChannel(sourceType, [
                { channel, via } as TicketMessage,
            ])
            expect(calculatedChannel).toBe(TicketChannel.Email)
        },
    )
})
