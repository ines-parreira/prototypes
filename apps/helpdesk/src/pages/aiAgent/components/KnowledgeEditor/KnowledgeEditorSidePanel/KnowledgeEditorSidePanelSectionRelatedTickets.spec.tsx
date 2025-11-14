import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from './KnowledgeEditorSidePanelSectionRelatedTickets'

describe('KnowledgeEditorSidePanelSectionRelatedTickets', () => {
    it('renders', () => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

        renderWithRouter(
            <KnowledgeEditorSidePanel
                initialExpandedSections={['related-tickets']}
            >
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    tickets={[
                        {
                            title: 'Still waiting on my order?',
                            content:
                                'I have a problem with my order, it arrived broken and doesn’t turn on.',
                            lastUpdatedDatetime: oneHourAgo,
                            url: 'https://gorgias.gorgias.com/app/views/123/456',
                        },
                        {
                            title: 'How to cancel my order?',
                            content: 'I want to cancel my order.',
                            lastUpdatedDatetime: oneHourAgo,
                            url: 'https://gorgias.gorgias.com/app/views/123/456',
                        },
                        {
                            title: 'How to track my order?',
                            content: 'I want to track my order.',
                            lastUpdatedDatetime: oneHourAgo,
                            url: 'https://gorgias.gorgias.com/app/views/123/456',
                        },
                    ]}
                    relatedTicketsUrl="https://gorgias.gorgias.com/app/views"
                    sectionId="related-tickets"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Related tickets')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('View all')).toBeInTheDocument()
        expect(
            screen.getByText('Still waiting on my order?'),
        ).toBeInTheDocument()
        expect(screen.getByText('How to cancel my order?')).toBeInTheDocument()
        expect(screen.getByText('How to track my order?')).toBeInTheDocument()
    })
})
