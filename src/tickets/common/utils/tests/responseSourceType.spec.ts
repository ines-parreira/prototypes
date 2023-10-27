import {TicketMessageSourceType, TicketVia} from 'business/types/ticket'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {EventType} from 'models/event/types'
import {TicketEvent, TicketMessage} from 'models/ticket/types'
import {DEFAULT_SOURCE_TYPE} from 'tickets/common/config'

import responseSourceType from '../responseSourceType'

describe('responseSourceType()', () => {
    it.each([
        {} as TicketMessage,
        {
            source: {type: TicketMessageSourceType.InternalNote},
        } as TicketMessage,
    ])(
        'should return message source type "internal-note" for Twilio ticket for certain types of messages',
        (lastMessage: TicketMessage) => {
            const messages: TicketMessage[] = [lastMessage]
            const events: TicketEvent[] = []

            const via = TicketVia.Twilio

            expect(responseSourceType(messages, via, events)).toEqual(
                TicketMessageSourceType.InternalNote
            )
        }
    )

    it('should return message source type "internal-note" for Twilio ticket with no messages', () => {
        const via = TicketVia.Twilio
        const messages: TicketMessage[] = []
        const events: TicketEvent[] = []

        expect(responseSourceType(messages, via, events)).toEqual(
            TicketMessageSourceType.InternalNote
        )
    })

    it('should return message source type "internal-note" for Twilio ticket with no events', () => {
        const message = {
            source: {type: TicketMessageSourceType.Twilio},
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const events: TicketEvent[] = []

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, events)).toEqual(
            TicketMessageSourceType.InternalNote
        )
    })

    it('should return message source type "internal-note" for Twilio ticket with non-phone event', () => {
        const message = {
            source: {type: TicketMessageSourceType.Twilio},
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const event = {
            type: EventType.TicketMerged,
        } as TicketEvent
        const events: TicketEvent[] = [event]

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, events)).toEqual(
            TicketMessageSourceType.InternalNote
        )
    })

    it.each([
        PhoneIntegrationEvent.MissedPhoneCall,
        PhoneIntegrationEvent.VoicemailRecording,
    ])(
        'should return message source type "phone" for Twilio ticket with last event missed phone call or voicemail recording',
        (eventType: PhoneIntegrationEvent) => {
            const message = {
                source: {type: TicketMessageSourceType.Twilio},
                created_datetime: '2022-06-21T16:47:00',
            } as TicketMessage
            const messages: TicketMessage[] = [message]
            const event = {
                type: eventType,
                created_datetime: '2022-06-22T18:42:00',
            } as TicketEvent
            const events: TicketEvent[] = [event]

            const via = TicketVia.Twilio

            expect(responseSourceType(messages, via, events)).toEqual(
                TicketMessageSourceType.Phone
            )
        }
    )

    it.each([
        PhoneIntegrationEvent.MissedPhoneCall,
        PhoneIntegrationEvent.VoicemailRecording,
    ])(
        'should return message source type "phone" for Twilio ticket with last event missed phone call or voicemail recording and a more recent internal message',
        (eventType: PhoneIntegrationEvent) => {
            const message = {
                source: {type: TicketMessageSourceType.InternalNote},
                created_datetime: '2022-06-21T16:47:00',
            } as TicketMessage
            const messages: TicketMessage[] = [message]
            const event = {
                type: eventType,
                created_datetime: '2022-06-20T13:23:00',
            } as TicketEvent
            const events: TicketEvent[] = [event]

            const via = TicketVia.Twilio

            expect(responseSourceType(messages, via, events)).toEqual(
                TicketMessageSourceType.Phone
            )
        }
    )

    it.each([
        PhoneIntegrationEvent.MissedPhoneCall,
        PhoneIntegrationEvent.VoicemailRecording,
    ])(
        'should return appropriate message source type for Twilio ticket with last event missed phone call or voicemail recording and a more recent message',
        (eventType: PhoneIntegrationEvent) => {
            const message = {
                source: {type: TicketMessageSourceType.Email},
                created_datetime: '2022-06-21T16:47:00',
            } as TicketMessage
            const messages: TicketMessage[] = [message]
            const event = {
                type: eventType,
                created_datetime: '2022-06-20T13:23:00',
            } as TicketEvent
            const events: TicketEvent[] = [event]

            const via = TicketVia.Twilio

            expect(responseSourceType(messages, via, events)).toEqual(
                TicketMessageSourceType.Email
            )
        }
    )

    it('should return SMS channel if the last message is an SMS on a Twilio ticket', () => {
        const message = {
            source: {type: TicketMessageSourceType.Sms},
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const events: TicketEvent[] = []

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, events)).toEqual(
            TicketMessageSourceType.Sms
        )
    })

    it('should return SMS source type for SMS ticket that has one SMS message', () => {
        const message = {
            source: {type: TicketMessageSourceType.Sms},
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const via = TicketVia.Helpdesk
        const events: TicketEvent[] = []

        expect(responseSourceType(messages, via, events)).toEqual(
            TicketMessageSourceType.Sms
        )
    })

    it('should return default message source type for email ticket that has no message', () => {
        const messages: TicketMessage[] = []
        const via = TicketVia.Email
        const events: TicketEvent[] = []

        expect(responseSourceType(messages, via, events)).toEqual(
            DEFAULT_SOURCE_TYPE
        )
    })

    it('should return default message source type for email ticket that has one email message', () => {
        const message = {
            source: {type: TicketMessageSourceType.Email},
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const via = TicketVia.Email
        const events: TicketEvent[] = []

        expect(responseSourceType(messages, via, events)).toEqual(
            DEFAULT_SOURCE_TYPE
        )
    })

    it.each([
        TicketMessageSourceType.FacebookMentionPost,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        'should return facebook mention comment channel if the last source is facebook mention post',
        (sourceType) => {
            const message = {
                source: {type: sourceType},
            } as TicketMessage
            const messages: TicketMessage[] = [message]
            const via = TicketVia.Facebook
            const events: TicketEvent[] = []

            expect(responseSourceType(messages, via, events)).toEqual(
                TicketMessageSourceType.FacebookMentionComment
            )
        }
    )

    it.each([
        TicketMessageSourceType.TwitterTweet,
        TicketMessageSourceType.TwitterQuotedTweet,
        TicketMessageSourceType.TwitterMentionTweet,
    ])(
        'should return twitter tweet source if the last source is twitter tweet or quoted tweet',
        (sourceType) => {
            const message = {
                source: {type: sourceType},
            } as TicketMessage
            const messages: TicketMessage[] = [message]
            const via = TicketVia.Twitter
            const events: TicketEvent[] = []

            expect(responseSourceType(messages, via, events)).toEqual(
                TicketMessageSourceType.TwitterTweet
            )
        }
    )
})
