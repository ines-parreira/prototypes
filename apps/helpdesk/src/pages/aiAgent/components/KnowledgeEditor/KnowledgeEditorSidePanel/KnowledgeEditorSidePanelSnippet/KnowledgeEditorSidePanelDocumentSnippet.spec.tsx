import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { screen } from '@testing-library/react'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { KnowledgeEditorSidePanelDocumentSnippet } from './KnowledgeEditorSidePanelDocumentSnippet'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('KnowledgeEditorSidePanelDocumentSnippet', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation((flagKey) => {
            if (
                flagKey === FeatureFlagKey.PerformanceStatsOnIndividualKnowledge
            ) {
                return true
            }
            return false
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })
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
                relatedTickets={{
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
})
