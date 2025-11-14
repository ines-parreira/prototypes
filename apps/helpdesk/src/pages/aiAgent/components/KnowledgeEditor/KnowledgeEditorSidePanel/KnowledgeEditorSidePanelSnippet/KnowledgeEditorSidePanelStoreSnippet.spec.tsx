import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { KnowledgeEditorSidePanelStoreSnippet } from './KnowledgeEditorSidePanelStoreSnippet'

describe('KnowledgeEditorSidePanelStoreSnippet', () => {
    it('renders', () => {
        renderWithRouter(
            <KnowledgeEditorSidePanelStoreSnippet
                details={{
                    aiAgentStatus: { value: true, onChange: jest.fn() },
                    createdDatetime: new Date('2025-06-17'),
                    lastUpdatedDatetime: new Date('2025-06-17'),
                    urls: ['https://www.google.com', 'https://www.google.com'],
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
                            url: 'https://www.google.com',
                            title: 'Ticket 1',
                            content: 'Ticket 1 content',
                        },
                        {
                            lastUpdatedDatetime: new Date('2025-06-17'),
                            url: 'https://www.google.com',
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
