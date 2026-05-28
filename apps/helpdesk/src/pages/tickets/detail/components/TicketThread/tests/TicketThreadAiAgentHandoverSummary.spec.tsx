import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGenerateTicketSummaryHandler,
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockTicket,
} from '@gorgias/helpdesk-mocks'
import type { Ticket } from '@gorgias/helpdesk-types'
import { setDefaultConfig } from '@gorgias/knowledge-service-client'
import {
    mockFindAiReasoningAiReasoningHandler,
    mockFindFeedbackHandler,
} from '@gorgias/knowledge-service-mocks'

import { ReasoningResponseType } from 'models/knowledgeService/queries'
import {
    AiAgentFeedbackTypeEnum,
    FeedbackRating,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { TicketThreadAiAgentHandoverSummary } from '../TicketThreadAiAgentHandoverSummary'

setDefaultConfig({ baseURL: 'http://localhost:3000' })

const server = setupServer()

const message = {
    id: 554666281,
    created_datetime: '2026-04-07T17:04:06.597334+00:00',
}

const ticketId = 12345

const mockCurrentUser = mockGetCurrentUserHandler()
const mockGenerateSummary = mockGenerateTicketSummaryHandler()

const STUB_REASONING_FIELDS = {
    objectType: 'TICKET',
    objectId: '12345',
    executionId: 'exec-1',
    targetType: 'REPLY',
    targetId: 'target-1',
    createdDatetime: '2026-04-07T17:04:06.000Z',
} as const

const STUB_FEEDBACK_FIELDS = {
    objectType: 'TICKET',
    objectId: '12345',
    executionId: 'exec-1',
    targetType: 'TICKET',
    targetId: '12345',
    submittedBy: 1,
    createdDatetime: '2026-04-07T17:04:06.000Z',
    updatedDatetime: '2026-04-07T17:04:06.000Z',
} as const

const emptyReasoningHandler = mockFindAiReasoningAiReasoningHandler(async () =>
    HttpResponse.json({
        reasoning: [],
        resources: [],
        usedTasks: [],
        canceledTasks: [],
    }),
)

const emptyFeedbackHandler = mockFindFeedbackHandler(async () =>
    HttpResponse.json({
        accountId: 1,
        objectType: 'TICKET',
        objectId: '12345',
        executions: [],
    }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

beforeEach(() => {
    server.use(
        mockCurrentUser.handler,
        emptyReasoningHandler.handler,
        emptyFeedbackHandler.handler,
        mockGenerateSummary.handler,
    )
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

function mockTicketResponse(overrides: Partial<Ticket> = {}) {
    const { handler } = mockGetTicketHandler(async () =>
        HttpResponse.json(
            mockTicket({
                id: ticketId,
                last_message_datetime: message.created_datetime,
                summary: null,
                ...overrides,
            }),
        ),
    )

    server.use(handler)
}

function renderComponent({
    props = { message },
    ticketOverrides = {},
}: {
    props?: Parameters<typeof TicketThreadAiAgentHandoverSummary>[0]
    ticketOverrides?: Partial<Ticket>
} = {}) {
    mockTicketResponse(ticketOverrides)

    return render(<TicketThreadAiAgentHandoverSummary {...props} />, {
        path: '/tickets/:ticketId',
        initialEntries: [`/tickets/${ticketId}`],
    })
}

describe('TicketThreadAiAgentHandoverSummary', () => {
    it('auto-triggers summary generation on mount when there is no existing summary', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Handover Summary')).toBeInTheDocument()
        })
    })

    it('shows the handover reason section with its value when an OUTCOME is present', async () => {
        const { handler } = mockFindAiReasoningAiReasoningHandler(async () =>
            HttpResponse.json({
                reasoning: [
                    {
                        ...STUB_REASONING_FIELDS,
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'Order delay exceeded the automated assistance threshold',
                    },
                ],
                resources: [],
                usedTasks: [],
                canceledTasks: [],
            }),
        )
        server.use(handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Handover reason')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Order delay exceeded the automated assistance threshold',
                ),
            ).toBeInTheDocument()
        })
    })

    it('shows the ticket summary when the summary predates the handover message', async () => {
        renderComponent({
            ticketOverrides: {
                summary: {
                    content: 'Customer asked about delayed order #981075',
                    created_datetime: '2026-04-06T10:00:00.000Z',
                    updated_datetime: '2026-04-06T10:00:00.000Z',
                    triggered_by: 1,
                },
            },
        })

        await waitFor(() => {
            expect(
                screen.getByText('Customer asked about delayed order #981075'),
            ).toBeInTheDocument()
        })
    })

    it('shows the ticket summary alongside the handover reason when the summary was generated after the handover', async () => {
        const { handler } = mockFindAiReasoningAiReasoningHandler(async () =>
            HttpResponse.json({
                reasoning: [
                    {
                        ...STUB_REASONING_FIELDS,
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'Handover due to order delay',
                    },
                ],
                resources: [],
                usedTasks: [],
                canceledTasks: [],
            }),
        )
        server.use(handler)

        renderComponent({
            ticketOverrides: {
                summary: {
                    content: 'Customer asked about delayed order #981075',
                    created_datetime: '2026-04-09T21:12:12.000Z',
                    updated_datetime: '2026-04-09T21:12:12.000Z',
                    triggered_by: 1,
                },
            },
        })

        await waitFor(() => {
            expect(screen.getByText('Handover reason')).toBeInTheDocument()
            expect(
                screen.getByText('Handover due to order delay'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Customer asked about delayed order #981075'),
            ).toBeInTheDocument()
        })
    })

    it('shows the agent rating tag when a TICKET_RATING feedback entry is present', async () => {
        const { handler } = mockFindFeedbackHandler(async () =>
            HttpResponse.json({
                accountId: 1,
                objectType: 'TICKET',
                objectId: '12345',
                executions: [
                    {
                        executionId: 'exec-1',
                        resources: [],
                        feedback: [
                            {
                                ...STUB_FEEDBACK_FIELDS,
                                feedbackType:
                                    AiAgentFeedbackTypeEnum.TICKET_RATING,
                                feedbackValue: FeedbackRating.GOOD,
                            },
                        ],
                    },
                ],
            }),
        )
        server.use(handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Positive')).toBeInTheDocument()
        })
    })

    it('shows the ticket summary when it was generated after the handover', async () => {
        renderComponent({
            ticketOverrides: {
                summary: {
                    content: 'Customer asked about delayed order #981075',
                    created_datetime: '2026-04-08T10:00:00.000Z',
                    updated_datetime: '2026-04-08T10:00:00.000Z',
                    triggered_by: 1,
                },
            },
        })

        await waitFor(() => {
            expect(
                screen.getByText('Customer asked about delayed order #981075'),
            ).toBeInTheDocument()
        })
    })

    it('shows the ticket summary when updated_datetime is after the handover even if created_datetime predates it', async () => {
        renderComponent({
            ticketOverrides: {
                summary: {
                    content: 'Old summary content',
                    created_datetime: '2026-04-06T10:00:00.000Z',
                    updated_datetime: '2026-04-08T10:00:00.000Z',
                    triggered_by: 1,
                },
            },
        })

        await waitFor(() => {
            expect(screen.getByText('Old summary content')).toBeInTheDocument()
        })
    })

    it('shows the ticket summary alongside the handover reason when outcome is also present', async () => {
        const { handler } = mockFindAiReasoningAiReasoningHandler(async () =>
            HttpResponse.json({
                reasoning: [
                    {
                        ...STUB_REASONING_FIELDS,
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'Handover due to order delay',
                    },
                ],
                resources: [],
                usedTasks: [],
                canceledTasks: [],
            }),
        )
        server.use(handler)

        renderComponent({
            ticketOverrides: {
                summary: {
                    content: 'Customer asked about delayed order #981075',
                    created_datetime: '2026-04-08T10:00:00.000Z',
                    updated_datetime: '2026-04-08T10:00:00.000Z',
                    triggered_by: 1,
                },
            },
        })

        await waitFor(() => {
            expect(
                screen.getByText('Customer asked about delayed order #981075'),
            ).toBeInTheDocument()
            expect(screen.getByText('Handover reason')).toBeInTheDocument()
            expect(
                screen.getByText('Handover due to order delay'),
            ).toBeInTheDocument()
        })
    })

    it('shows a loading skeleton for the handover reason while the outcome is being fetched', async () => {
        const { handler } = mockFindAiReasoningAiReasoningHandler(async () =>
            HttpResponse.json({
                reasoning: [
                    {
                        ...STUB_REASONING_FIELDS,
                        responseType: ReasoningResponseType.OUTCOME,
                        value: 'Customer could not be helped automatically',
                    },
                ],
                resources: [],
                usedTasks: [],
                canceledTasks: [],
            }),
        )
        server.use(handler)

        renderComponent()

        // During the initial fetch the label is already visible with a skeleton body.
        expect(screen.getByText('Handover Summary')).toBeInTheDocument()

        await waitFor(() => {
            expect(
                screen.getByText('Customer could not be helped automatically'),
            ).toBeInTheDocument()
        })
    })

    it('shows only the stale warning when there are new messages after the summary was generated', async () => {
        renderComponent({
            ticketOverrides: {
                last_message_datetime: '2026-05-06T11:49:11.000Z',
                summary: {
                    content: 'Customer asked about delayed order #981075',
                    created_datetime: '2026-04-15T14:23:10.000Z',
                    updated_datetime: '2026-05-06T11:49:11.000Z',
                    triggered_by: 1,
                },
            },
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    /New messages have been added since this summary was generated/,
                ),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByText('Customer asked about delayed order #981075'),
        ).not.toBeInTheDocument()
    })

    it('does not show the stale warning when the summary covers all messages', async () => {
        renderComponent({
            ticketOverrides: {
                summary: {
                    content: 'Customer asked about delayed order #981075',
                    created_datetime: '2026-04-15T14:23:10.000Z',
                    updated_datetime: '2026-04-27T10:19:18.000Z',
                    triggered_by: 1,
                },
            },
        })

        await waitFor(() => {
            expect(
                screen.getByText('Customer asked about delayed order #981075'),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByText(
                /New messages have been added since this summary was generated/,
            ),
        ).not.toBeInTheDocument()
    })
})
