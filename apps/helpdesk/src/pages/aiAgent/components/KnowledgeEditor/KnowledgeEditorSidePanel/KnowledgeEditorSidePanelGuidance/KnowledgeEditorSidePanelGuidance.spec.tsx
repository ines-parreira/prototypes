import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSidePanelGuidance } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'

describe('KnowledgeEditorSidePanelGuidance', () => {
    it('renders', () => {
        render(
            <KnowledgeEditorSidePanelGuidance
                details={{
                    aiAgentStatus: { value: true, onChange: jest.fn() },
                    createdDatetime: new Date('2025-06-17'),
                    lastUpdatedDatetime: new Date('2025-06-17'),
                    isUpdating: false,
                }}
                impact={{
                    successRate: 0.28,
                    csat: 3.2,
                    gmvInfluenced: { value: 1200, currency: 'USD' },
                }}
                relatedTickets={{
                    tickets: [
                        {
                            lastUpdatedDatetime: new Date('2025-06-17'),
                            url: 'https://www.url-1.com',
                            title: 'Ticket 1',
                            content: 'Ticket 1 content',
                        },
                        {
                            lastUpdatedDatetime: new Date('2025-06-17'),
                            url: 'https://www.url-2.com',
                            title: 'Ticket 2',
                            content: 'Ticket 2 content',
                        },
                    ],
                }}
            />,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('Related tickets')).toBeInTheDocument()
    })
})
