import { mockTicketSatisfactionSurvey } from '@gorgias/helpdesk-mocks'

import { TicketThreadItemTag } from '../../types'
import {
    isRespondedSatisfactionSurveyItem,
    isScheduledSatisfactionSurveyItem,
    isSentSatisfactionSurveyItem,
    isTicketSatisfactionSurvey,
    isToBeSentSatisfactionSurveyItem,
} from '../predicates'
import { ticketThreadSatisfactionSurveyItemSchema } from '../schemas'
import type { TicketThreadSatisfactionSurveyItem } from '../types'

function createRawSurvey(
    overrides?: Parameters<typeof mockTicketSatisfactionSurvey>[0],
) {
    return mockTicketSatisfactionSurvey({
        body_text: null,
        created_datetime: '2024-03-21T11:00:00Z',
        customer_id: 12,
        id: 11,
        score: null,
        scored_datetime: null,
        sent_datetime: null,
        should_send_datetime: null,
        ticket_id: 24,
        ...overrides,
    })
}

describe('ticket thread satisfaction survey predicates', () => {
    it('accepts a valid sent survey item schema', () => {
        const sentSurvey = createRawSurvey({
            sent_datetime: '2024-03-21T11:45:00Z',
        })
        if (!isSentSatisfactionSurveyItem(sentSurvey)) {
            throw new Error('Expected a sent satisfaction survey mock')
        }
        const item: TicketThreadSatisfactionSurveyItem = {
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'sent',
            data: {
                ...sentSurvey,
                authorLabel: 'Jane Customer',
            },
            datetime: '2024-03-21T11:00:00Z',
        }

        expect(
            ticketThreadSatisfactionSurveyItemSchema.safeParse(item).success,
        ).toBe(true)
    })

    it('rejects malformed sent survey item data in the discriminated schema', () => {
        expect(
            ticketThreadSatisfactionSurveyItemSchema.safeParse({
                datetime: '2024-03-21T11:00:00Z',
                status: 'sent',
                data: {
                    authorLabel: 'Jane Customer',
                    created_datetime: '2024-03-21T11:00:00Z',
                    customer_id: 12,
                    id: 11,
                    sent_datetime: null,
                    ticket_id: 24,
                },
            }).success,
        ).toBe(false)
    })

    it('still accepts the raw API satisfaction survey payload', () => {
        expect(
            isTicketSatisfactionSurvey(
                createRawSurvey({
                    sent_datetime: '2024-03-21T11:10:00Z',
                }),
            ),
        ).toBe(true)
    })

    it('narrows the raw survey responded subtype', () => {
        expect(
            isRespondedSatisfactionSurveyItem(
                createRawSurvey({
                    body_text: 'Helpful support',
                    score: 5,
                    scored_datetime: '2024-03-21T11:30:00Z',
                    sent_datetime: '2024-03-21T11:10:00Z',
                }),
            ),
        ).toBe(true)
    })

    it('accepts survey-backed and event-backed responded survey items', () => {
        const respondedSurvey = createRawSurvey({
            body_text: 'Helpful support',
            score: 5,
            scored_datetime: '2024-03-21T11:30:00Z',
            sent_datetime: '2024-03-21T11:10:00Z',
        })

        if (!isRespondedSatisfactionSurveyItem(respondedSurvey)) {
            throw new Error('Expected a responded satisfaction survey mock')
        }

        const surveyBackedItem: TicketThreadSatisfactionSurveyItem = {
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'responded',
            data: {
                ...respondedSurvey,
                authorLabel: 'Jane Customer',
                source: 'survey',
            },
            datetime: '2024-03-21T11:30:00Z',
        }

        const eventBackedItem: TicketThreadSatisfactionSurveyItem = {
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'responded',
            data: {
                authorLabel: 'Jane Customer',
                body_text: 'Helpful support',
                score: 5,
                source: 'event',
            },
            datetime: '2024-03-21T11:30:00Z',
        }

        expect(
            ticketThreadSatisfactionSurveyItemSchema.safeParse(surveyBackedItem)
                .success,
        ).toBe(true)
        expect(
            ticketThreadSatisfactionSurveyItemSchema.safeParse(eventBackedItem)
                .success,
        ).toBe(true)
    })

    it('narrows the raw survey sent, scheduled, and to-be-sent subtypes', () => {
        expect(
            isSentSatisfactionSurveyItem(
                createRawSurvey({
                    sent_datetime: '2024-03-21T11:10:00Z',
                }),
            ),
        ).toBe(true)

        expect(
            isScheduledSatisfactionSurveyItem(
                createRawSurvey({
                    should_send_datetime: '2024-03-21T13:00:00Z',
                }),
            ),
        ).toBe(true)

        expect(isToBeSentSatisfactionSurveyItem(createRawSurvey())).toBe(true)
    })

    it('rejects impossible raw survey subtype combinations', () => {
        expect(
            isSentSatisfactionSurveyItem(
                createRawSurvey({
                    body_text: 'Should not exist before a response',
                    sent_datetime: '2024-03-21T11:10:00Z',
                }),
            ),
        ).toBe(false)

        expect(
            isScheduledSatisfactionSurveyItem(
                createRawSurvey({
                    sent_datetime: '2024-03-21T11:10:00Z',
                    should_send_datetime: '2024-03-21T13:00:00Z',
                }),
            ),
        ).toBe(false)
    })
})
