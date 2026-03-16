import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { ListEventsObjectType } from '@gorgias/helpdesk-client'
import {
    mockEvent,
    mockListEventsHandler,
    mockListEventsResponse,
    mockListSatisfactionSurveysHandler,
    mockListSatisfactionSurveysResponse,
    mockSatisfactionSurvey,
    mockTicket,
    mockTicketCustomer,
    mockTicketSatisfactionSurvey,
} from '@gorgias/helpdesk-mocks'

import { createTestQueryClient, renderHook } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { TicketThreadItemTag } from '../../types'
import { SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE } from '../constants'
import { useTicketThreadSatisfactionSurveys } from '../useTicketThreadSatisfactionSurveys'

function createTicketWithSurvey(
    overrides?: Parameters<typeof mockTicket>[0],
    surveyOverrides?: Parameters<typeof mockTicketSatisfactionSurvey>[0],
) {
    return mockTicket({
        customer: mockTicketCustomer({
            name: 'Jane Customer',
            email: 'jane@example.com',
        }),
        satisfaction_survey: mockTicketSatisfactionSurvey({
            id: 11,
            customer_id: 12,
            ticket_id: 24,
            created_datetime: '2024-03-21T11:00:00Z',
            scored_datetime: '2024-03-21T11:30:00Z',
            sent_datetime: '2024-03-21T11:10:00Z',
            should_send_datetime: null,
            score: 5,
            body_text: 'Original survey body',
            ...surveyOverrides,
        }),
        ...overrides,
    })
}

describe('useTicketThreadSatisfactionSurveys', () => {
    beforeEach(() => {
        server.use(
            mockListEventsHandler(async () =>
                HttpResponse.json(
                    mockListEventsResponse({
                        data: [],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    }),
                ),
            ).handler,
        )
    })

    it('renders the responded survey item when a responded event exists', async () => {
        const ticket = createTicketWithSurvey()
        server.use(
            mockListEventsHandler(async () =>
                HttpResponse.json(
                    mockListEventsResponse({
                        data: [
                            mockEvent({
                                id: 44,
                                object_id: 11,
                                object_type:
                                    ListEventsObjectType.SatisfactionSurvey,
                                type: SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE,
                                created_datetime: '2024-03-21T11:45:00Z',
                                data: {
                                    score: 4,
                                    body_text: 'Great support',
                                },
                            } as any),
                        ],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadSatisfactionSurveys({
                    ticketId: 24,
                    ticket,
                }),
            {
                queryClient: createTestQueryClient(),
            },
        )

        await waitFor(() => {
            expect(result.current).toEqual([
                {
                    _tag: TicketThreadItemTag.SatisfactionSurvey,
                    status: 'responded',
                    data: {
                        authorLabel: 'Jane Customer',
                        body_text: 'Great support',
                        score: 4,
                        source: 'event',
                    },
                    datetime: '2024-03-21T11:45:00Z',
                },
            ])
        })
    })

    it('uses scored_datetime as primary timeline datetime', () => {
        const ticket = createTicketWithSurvey(undefined, {
            score: 3,
            body_text: null,
        })

        const { result } = renderHook(
            () =>
                useTicketThreadSatisfactionSurveys({
                    ticketId: 24,
                    ticket,
                }),
            {
                queryClient: createTestQueryClient(),
            },
        )

        expect(result.current).toHaveLength(1)
        expect(result.current[0]).toMatchObject({
            _tag: TicketThreadItemTag.SatisfactionSurvey,
            status: 'responded',
            data: {
                authorLabel: 'Jane Customer',
                body_text: null,
                created_datetime: '2024-03-21T11:00:00Z',
                customer_id: 12,
                id: 11,
                score: 3,
                scored_datetime: '2024-03-21T11:30:00Z',
                sent_datetime: '2024-03-21T11:10:00Z',
                source: 'survey',
                should_send_datetime: null,
                ticket_id: 24,
            },
            datetime: '2024-03-21T11:30:00Z',
        })
    })

    it('falls back to created_datetime for timeline ordering when survey is not scored', () => {
        const ticket = createTicketWithSurvey(
            {
                customer: mockTicketCustomer({
                    name: null,
                    email: 'jane@example.com',
                }),
            },
            {
                score: null,
                body_text: null,
                scored_datetime: null,
            },
        )

        const { result } = renderHook(
            () =>
                useTicketThreadSatisfactionSurveys({
                    ticketId: 24,
                    ticket,
                }),
            {
                queryClient: createTestQueryClient(),
            },
        )

        expect(result.current[0]?.datetime).toBe('2024-03-21T11:00:00Z')
        expect(result.current[0]?.data).toMatchObject({
            authorLabel: 'jane@example.com',
            body_text: null,
            created_datetime: '2024-03-21T11:00:00Z',
            customer_id: 12,
            id: 11,
            score: null,
            scored_datetime: null,
            sent_datetime: '2024-03-21T11:10:00Z',
            should_send_datetime: null,
            ticket_id: 24,
        })
        expect(result.current[0]?.status).toBe('sent')
    })

    it('maps a survey without sent or scheduled dates to to-be-sent', () => {
        const ticket = createTicketWithSurvey(undefined, {
            score: null,
            body_text: null,
            scored_datetime: null,
            sent_datetime: null,
            should_send_datetime: null,
        })

        const { result } = renderHook(
            () =>
                useTicketThreadSatisfactionSurveys({
                    ticketId: 24,
                    ticket,
                }),
            {
                queryClient: createTestQueryClient(),
            },
        )

        expect(result.current[0]?.data).toMatchObject({
            authorLabel: 'Jane Customer',
            body_text: null,
            created_datetime: '2024-03-21T11:00:00Z',
            customer_id: 12,
            id: 11,
            score: null,
            scored_datetime: null,
            sent_datetime: null,
            should_send_datetime: null,
            ticket_id: 24,
        })
        expect(result.current[0]?.status).toBe('to-be-sent')
    })

    it('falls back to listing satisfaction surveys when the ticket payload has no inline survey', async () => {
        server.use(
            mockListSatisfactionSurveysHandler(async () =>
                HttpResponse.json(
                    mockListSatisfactionSurveysResponse({
                        data: [
                            mockSatisfactionSurvey({
                                id: 77,
                                ticket_id: 24,
                                customer_id: 12,
                                score: null,
                                body_text: null,
                                created_datetime: '2024-03-21T11:00:00Z',
                                scored_datetime: null,
                                sent_datetime: null,
                                should_send_datetime: '2024-03-21T13:00:00Z',
                            }),
                        ],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    }),
                ),
            ).handler,
            mockListEventsHandler(async () =>
                HttpResponse.json(
                    mockListEventsResponse({
                        data: [],
                        meta: {
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useTicketThreadSatisfactionSurveys({
                    ticketId: 24,
                    ticket: mockTicket({
                        customer: mockTicketCustomer({
                            name: 'Jane Customer',
                            email: 'jane@example.com',
                        }),
                        satisfaction_survey: null,
                    }),
                }),
            {
                queryClient: createTestQueryClient(),
            },
        )

        await waitFor(() => {
            expect(result.current).toHaveLength(1)
            expect(result.current[0]).toMatchObject({
                _tag: TicketThreadItemTag.SatisfactionSurvey,
                status: 'scheduled',
                data: {
                    authorLabel: 'Jane Customer',
                    body_text: null,
                    created_datetime: '2024-03-21T11:00:00Z',
                    customer_id: 12,
                    id: 77,
                    score: null,
                    scored_datetime: null,
                    sent_datetime: null,
                    should_send_datetime: '2024-03-21T13:00:00Z',
                    ticket_id: 24,
                },
                datetime: '2024-03-21T11:00:00Z',
            })
        })
    })
})
