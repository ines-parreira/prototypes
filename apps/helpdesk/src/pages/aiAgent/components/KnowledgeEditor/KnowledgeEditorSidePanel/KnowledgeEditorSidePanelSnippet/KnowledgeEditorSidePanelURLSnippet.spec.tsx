import { screen } from '@testing-library/react'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { renderWithRouter } from 'utils/testing'

import { KnowledgeEditorSidePanelURLSnippet } from './KnowledgeEditorSidePanelURLSnippet'

describe('KnowledgeEditorSidePanelURLSnippet', () => {
    it('renders', () => {
        renderWithRouter(
            <KnowledgeEditorSidePanelURLSnippet
                details={{
                    aiAgentStatus: {
                        value: true,
                        onChange: jest.fn(),
                    },
                    createdDatetime: new Date('2025-06-17'),
                    lastUpdatedDatetime: new Date('2025-06-17'),
                    url: 'https://www.google.com',
                }}
                impact={{
                    tickets: { value: 150 },
                    handoverTickets: { value: 42 },
                    csat: { value: 3.2 },
                    intents: ['Billing/Payment', 'Shipping/Inquiry'],
                }}
                relatedTickets={{
                    tickets: [
                        {
                            lastUpdatedDatetime: new Date('2025-06-17'),
                            url: 'https://www.google.com',
                            title: 'Ticket 1',
                            messageCount: 2,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                        {
                            lastUpdatedDatetime: new Date('2025-06-17'),
                            url: 'https://www.google.com',
                            title: 'Ticket 2',
                            messageCount: 4,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
                        },
                    ],
                }}
            />,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
    })
})
