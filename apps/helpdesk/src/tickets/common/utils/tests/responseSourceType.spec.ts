import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { TicketMessageSourceType, TicketVia } from 'business/types/ticket'
import type { TicketMessage } from 'models/ticket/types'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import * as voiceCallUtils from 'models/voiceCall/types'
import { DEFAULT_SOURCE_TYPE } from 'tickets/common/config'

import responseSourceType from '../responseSourceType'

const isVoiceCallSpy = jest.spyOn(voiceCallUtils, 'isVoiceCall')

describe('responseSourceType()', () => {
    afterEach(async () => {
        await appQueryClient.resetQueries()
    })

    it.each([
        {} as TicketMessage,
        {
            source: { type: TicketMessageSourceType.InternalNote },
        } as TicketMessage,
    ])(
        'should return message source type "internal-note" for Twilio ticket for certain types of messages',
        (lastMessage: TicketMessage) => {
            const messages: TicketMessage[] = [lastMessage]

            const via = TicketVia.Twilio

            expect(responseSourceType(messages, via, 1)).toEqual(
                TicketMessageSourceType.InternalNote,
            )
        },
    )

    it('should return message source type "internal-note" for Twilio ticket with no messages', () => {
        const via = TicketVia.Twilio
        const messages: TicketMessage[] = []

        expect(responseSourceType(messages, via, 1)).toEqual(
            TicketMessageSourceType.InternalNote,
        )
    })

    it('should return message source type "internal-note" for Twilio ticket with no voice calls', () => {
        const message = {
            source: { type: TicketMessageSourceType.Twilio },
        } as TicketMessage
        const messages: TicketMessage[] = [message]

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, 1)).toEqual(
            TicketMessageSourceType.InternalNote,
        )
    })

    it('should return message source type "phone" for Twilio ticket with last item missed phone call', () => {
        const message = {
            source: { type: TicketMessageSourceType.Twilio },
            created_datetime: '2022-06-21T16:47:00',
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const voiceCall = {
            created_datetime: '2022-06-22T18:42:00',
            status: VoiceCallStatus.Completed,
            direction: 'inbound',
        } as voiceCallUtils.VoiceCall

        isVoiceCallSpy.mockReturnValue(true)
        appQueryClient.setQueryData(voiceCallsKeys.list({ ticket_id: 1 }), {
            data: [voiceCall],
        })

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, 1)).toEqual(
            TicketMessageSourceType.Phone,
        )
    })

    it('should return message source type "phone" for Twilio ticket with last item missed phone call and a more recent internal message', () => {
        const message = {
            source: { type: TicketMessageSourceType.InternalNote },
            created_datetime: '2022-06-21T16:47:00',
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const voiceCall = {
            created_datetime: '2022-06-20T13:23:00',
            status: VoiceCallStatus.Completed,
            direction: 'inbound',
        } as voiceCallUtils.VoiceCall

        isVoiceCallSpy.mockReturnValue(true)
        appQueryClient.setQueryData(voiceCallsKeys.list({ ticket_id: 1 }), {
            data: [voiceCall],
        })

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, 1)).toEqual(
            TicketMessageSourceType.Phone,
        )
    })

    it('should return appropriate message source type for Twilio ticket with last item missed phone call and a more recent message', () => {
        const message = {
            source: { type: TicketMessageSourceType.Email },
            created_datetime: '2022-06-21T16:47:00',
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const voiceCall = {
            created_datetime: '2022-06-20T13:23:00',
            status: VoiceCallStatus.Completed,
            direction: 'inbound',
        } as voiceCallUtils.VoiceCall

        isVoiceCallSpy.mockReturnValue(true)
        appQueryClient.setQueryData(voiceCallsKeys.list({ ticket_id: 1 }), {
            data: [voiceCall],
        })

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, 1)).toEqual(
            TicketMessageSourceType.Email,
        )
    })

    it('should return SMS channel if the last message is an SMS on a Twilio ticket', () => {
        const message = {
            source: { type: TicketMessageSourceType.Sms },
        } as TicketMessage
        const messages: TicketMessage[] = [message]

        const via = TicketVia.Twilio

        expect(responseSourceType(messages, via, 1)).toEqual(
            TicketMessageSourceType.Sms,
        )
    })

    it('should return SMS source type for SMS ticket that has one SMS message', () => {
        const message = {
            source: { type: TicketMessageSourceType.Sms },
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const via = TicketVia.Helpdesk

        expect(responseSourceType(messages, via, 1)).toEqual(
            TicketMessageSourceType.Sms,
        )
    })

    it('should return default message source type for email ticket that has no message', () => {
        const messages: TicketMessage[] = []
        const via = TicketVia.Email

        expect(responseSourceType(messages, via, 1)).toEqual(
            DEFAULT_SOURCE_TYPE,
        )
    })

    it('should return default message source type for email ticket that has one email message', () => {
        const message = {
            source: { type: TicketMessageSourceType.Email },
        } as TicketMessage
        const messages: TicketMessage[] = [message]
        const via = TicketVia.Email

        expect(responseSourceType(messages, via, 1)).toEqual(
            DEFAULT_SOURCE_TYPE,
        )
    })

    it.each([
        TicketMessageSourceType.FacebookMentionPost,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        'should return facebook mention comment channel if the last source is facebook mention post',
        (sourceType) => {
            const message = {
                source: { type: sourceType },
            } as TicketMessage
            const messages: TicketMessage[] = [message]
            const via = TicketVia.Facebook

            expect(responseSourceType(messages, via, 1)).toEqual(
                TicketMessageSourceType.FacebookMentionComment,
            )
        },
    )

    it.each([
        TicketMessageSourceType.TwitterTweet,
        TicketMessageSourceType.TwitterQuotedTweet,
        TicketMessageSourceType.TwitterMentionTweet,
    ])(
        'should return twitter tweet source if the last source is twitter tweet or quoted tweet',
        (sourceType) => {
            const message = {
                source: { type: sourceType },
            } as TicketMessage
            const messages: TicketMessage[] = [message]
            const via = TicketVia.Twitter

            expect(responseSourceType(messages, via, 1)).toEqual(
                TicketMessageSourceType.TwitterTweet,
            )
        },
    )
})
