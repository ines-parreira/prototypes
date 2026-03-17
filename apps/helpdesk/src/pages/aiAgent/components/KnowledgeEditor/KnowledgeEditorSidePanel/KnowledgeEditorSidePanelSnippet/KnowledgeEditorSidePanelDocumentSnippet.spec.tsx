import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'

import { UserRole } from 'config/types/user'
import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { KnowledgeEditorSidePanelDocumentSnippet } from './KnowledgeEditorSidePanelDocumentSnippet'

const server = setupServer()
const mockGetCurrentUser = mockGetCurrentUserHandler()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
    server.use(mockGetCurrentUser.handler)
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('KnowledgeEditorSidePanelDocumentSnippet', () => {
    it('renders with required props', () => {
        const testDate = new Date('2025-06-17')
        const testDateRange = {
            start_datetime: new Date(
                Date.now() - 28 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            end_datetime: new Date().toISOString(),
        }

        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanelDocumentSnippet
                details={{
                    aiAgentStatus: { value: true, onChange: jest.fn() },
                    createdDatetime: testDate,
                    lastUpdatedDatetime: testDate,
                    sourceDocument: 'https://some-doc/doc.pdf',
                    googleStorageUrl:
                        'https://storage.googleapis.com/bucket/doc.pdf',
                }}
                impact={{
                    tickets: { value: 150 },
                    handoverTickets: { value: 42 },
                    csat: { value: 3.2 },
                    intents: ['Billing/Payment', 'Shipping/Inquiry'],
                }}
                recentTickets={{
                    ticketCount: 2,
                    latest3Tickets: [
                        {
                            id: 1,
                            lastUpdatedDatetime: testDate,
                            title: 'Ticket 1',
                            messageCount: 2,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                        {
                            id: 2,
                            lastUpdatedDatetime: testDate,
                            title: 'Ticket 2',
                            messageCount: 4,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
                        },
                    ],
                    resourceSourceId: 123,
                    resourceSourceSetId: 456,
                    dateRange: testDateRange,
                    outcomeCustomFieldId: 789,
                    intentCustomFieldId: 101112,
                }}
            />,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
    })

    it('renders execution ID in backend IDs when provided and user is Gorgias agent', async () => {
        const { handler } = mockGetCurrentUserHandler(async () =>
            HttpResponse.json({
                ...mockGetCurrentUser.data,
                role: { name: UserRole.GorgiasAgent },
            }),
        )
        server.use(handler)

        const testDate = new Date('2025-06-17')

        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanelDocumentSnippet
                details={{
                    aiAgentStatus: { value: true, onChange: jest.fn() },
                    createdDatetime: testDate,
                    lastUpdatedDatetime: testDate,
                    sourceDocument: 'https://some-doc/doc.pdf',
                    googleStorageUrl:
                        'https://storage.googleapis.com/bucket/doc.pdf',
                }}
                snippetId={42}
                executionId="exec-doc-789"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Execution ID:')).toBeInTheDocument()
            expect(screen.getByText('exec-doc-789')).toBeInTheDocument()
        })
    })

    it('does not render execution ID in backend IDs when not provided', async () => {
        const { handler } = mockGetCurrentUserHandler(async () =>
            HttpResponse.json({
                ...mockGetCurrentUser.data,
                role: { name: UserRole.GorgiasAgent },
            }),
        )
        server.use(handler)

        const testDate = new Date('2025-06-17')

        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanelDocumentSnippet
                details={{
                    aiAgentStatus: { value: true, onChange: jest.fn() },
                    createdDatetime: testDate,
                    lastUpdatedDatetime: testDate,
                    sourceDocument: 'https://some-doc/doc.pdf',
                    googleStorageUrl:
                        'https://storage.googleapis.com/bucket/doc.pdf',
                }}
                snippetId={42}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Snippet ID (SourceId):'),
            ).toBeInTheDocument()
        })
        expect(screen.queryByText('Execution ID:')).not.toBeInTheDocument()
    })
})
