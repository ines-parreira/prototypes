import { TicketThreadItemTag } from '../../types'
import {
    isNonRenderablePrivateReplyEvent,
    isPrivateReplyEvent,
} from '../predicates'
import { shouldRenderTicketThreadEvent, toTaggedEvent } from '../transforms'

describe('ticket thread event predicates', () => {
    const baseEvent = {
        object_type: 'ticket',
        created_datetime: '2024-03-21T11:00:00Z',
    }

    it('identifies deprecated private reply events as renderable', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {
                action_name: 'facebookPrivateReply',
                payload: {
                    private_reply_event_type:
                        'MessagingTicketPrivateReplyEvent',
                },
                facebook_comment_ticket_id: '12',
            },
        }

        expect(isPrivateReplyEvent(event)).toBe(true)
        expect(isNonRenderablePrivateReplyEvent(event)).toBe(false)
    })

    it('identifies new-format private reply events as non-renderable', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {
                action_name: 'facebookPrivateReply',
                payload: {
                    private_reply_event_type:
                        'MessagingTicketPrivateReplyEvent',
                },
            },
        }

        expect(isPrivateReplyEvent(event)).toBe(false)
        expect(isNonRenderablePrivateReplyEvent(event)).toBe(true)
    })

    it('tags satisfaction-survey-responded as a dedicated event', () => {
        const event = {
            ...baseEvent,
            type: 'satisfaction-survey-responded',
            data: { score: 5 },
        }

        expect(toTaggedEvent(event as any)).toMatchObject({
            _tag: TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent,
        })
    })

    it('filters out unknown events without renderable metadata', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {},
        }

        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })

    it('keeps action events with a known action_name payload shape', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {
                action_name: 'setStatus',
            },
        }

        expect(shouldRenderTicketThreadEvent(event as any)).toBe(true)
    })

    it('filters out action events when action_name is not a string', () => {
        const event = {
            ...baseEvent,
            type: 'ticket-updated',
            data: {
                action_name: 123,
            },
        }

        expect(shouldRenderTicketThreadEvent(event as any)).toBe(false)
    })
})
