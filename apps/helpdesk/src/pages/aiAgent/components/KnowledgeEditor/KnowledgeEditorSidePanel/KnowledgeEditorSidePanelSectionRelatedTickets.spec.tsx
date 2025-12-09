import { screen } from '@testing-library/react'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
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
                            lastUpdatedDatetime: oneHourAgo,
                            url: 'https://gorgias.gorgias.com/app/views/123/456',
                            messageCount: 2,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                        {
                            title: 'How to cancel my order?',
                            lastUpdatedDatetime: oneHourAgo,
                            url: 'https://gorgias.gorgias.com/app/views/123/456',
                            messageCount: 1,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
                        },
                        {
                            title: 'How to track my order?',
                            lastUpdatedDatetime: oneHourAgo,
                            url: 'https://gorgias.gorgias.com/app/views/123/456',
                            messageCount: 5,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                        {
                            title: 'Issue with my order',
                            lastUpdatedDatetime: oneHourAgo,
                            url: 'https://gorgias.gorgias.com/app/views/123/456',
                            messageCount: 5,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                    ]}
                    relatedTicketsUrl="https://gorgias.gorgias.com/app/views"
                    sectionId="related-tickets"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('View all')).toBeInTheDocument()
        expect(
            screen.getByText('Still waiting on my order?'),
        ).toBeInTheDocument()
        expect(screen.getByText('How to cancel my order?')).toBeInTheDocument()
        expect(screen.getByText('How to track my order?')).toBeInTheDocument()
    })
})
