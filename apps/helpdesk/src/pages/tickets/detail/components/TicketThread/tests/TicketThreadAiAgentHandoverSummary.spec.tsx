import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'
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

const ticketStoreState = {
    ticket: fromJS({ id: 12345, summary: null }),
}

const mockCurrentUser = mockGetCurrentUserHandler()

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
    )
})

afterEach(() => server.resetHandlers())

afterAll(() => server.close())

function renderComponent(props = { message }) {
    return render(<TicketThreadAiAgentHandoverSummary {...props} />, {
        storeState: ticketStoreState,
    })
}

describe('TicketThreadAiAgentHandoverSummary', () => {
    it('renders nothing when all data has loaded and there is no outcome, no summary, and no rating', async () => {
        const { container } = renderComponent()

        await waitFor(() => {
            expect(container).toBeEmptyDOMElement()
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
        render(<TicketThreadAiAgentHandoverSummary message={message} />, {
            storeState: {
                ticket: fromJS({
                    id: 12345,
                    summary: {
                        content: 'Customer asked about delayed order #981075',
                        created_datetime: '2026-04-06T10:00:00.000Z',
                        updated_datetime: null,
                        triggered_by: 1,
                    },
                }),
            },
        })

        await waitFor(() => {
            expect(
                screen.getByText('Customer asked about delayed order #981075'),
            ).toBeInTheDocument()
        })
    })

    it('hides the ticket summary when it was generated after the handover', async () => {
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

        render(<TicketThreadAiAgentHandoverSummary message={message} />, {
            storeState: {
                ticket: fromJS({
                    id: 12345,
                    summary: {
                        content: 'Customer asked about delayed order #981075',
                        created_datetime: '2026-04-09T21:12:12.000Z',
                        updated_datetime: null,
                        triggered_by: 1,
                    },
                }),
            },
        })

        await waitFor(() => {
            expect(screen.getByText('Handover reason')).toBeInTheDocument()
            expect(
                screen.getByText('Handover due to order delay'),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByText('Customer asked about delayed order #981075'),
        ).not.toBeInTheDocument()
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
})
