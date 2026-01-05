import { screen } from '@testing-library/react'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { KnowledgeEditorSidePanel } from './KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from './KnowledgeEditorSidePanelSectionRelatedTickets'

describe('KnowledgeEditorSidePanelSectionRelatedTickets', () => {
    it('renders', () => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const testDateRange = {
            start_datetime: new Date(
                Date.now() - 28 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            end_datetime: new Date().toISOString(),
        }

        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanel
                initialExpandedSections={['related-tickets']}
            >
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    ticketCount={4}
                    latest3Tickets={[
                        {
                            id: 123,
                            title: 'Still waiting on my order?',
                            lastUpdatedDatetime: oneHourAgo,
                            messageCount: 2,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                        {
                            id: 456,
                            title: 'How to cancel my order?',
                            lastUpdatedDatetime: oneHourAgo,
                            messageCount: 1,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
                        },
                        {
                            id: 789,
                            title: 'How to track my order?',
                            lastUpdatedDatetime: oneHourAgo,
                            messageCount: 5,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                    ]}
                    resourceSourceId={123}
                    resourceSourceSetId={456}
                    dateRange={testDateRange}
                    outcomeCustomFieldId={789}
                    intentCustomFieldId={101112}
                    sectionId="related-tickets"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('View more')).toBeInTheDocument()
        expect(
            screen.getByText('Still waiting on my order?'),
        ).toBeInTheDocument()
        expect(screen.getByText('How to cancel my order?')).toBeInTheDocument()
        expect(screen.getByText('How to track my order?')).toBeInTheDocument()
    })

    it('renders loading skeletons when isLoading is true', () => {
        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanel
                initialExpandedSections={['related-tickets']}
            >
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    ticketCount={0}
                    isLoading={true}
                    sectionId="related-tickets"
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('renders 0 for ticket count when ticketCount is undefined and not loading', () => {
        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanel
                initialExpandedSections={['related-tickets']}
            >
                <KnowledgeEditorSidePanelSectionRelatedTickets sectionId="related-tickets" />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('renders correctly with less than 3 tickets (1 ticket)', () => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const testDateRange = {
            start_datetime: new Date(
                Date.now() - 28 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            end_datetime: new Date().toISOString(),
        }

        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanel
                initialExpandedSections={['related-tickets']}
            >
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    ticketCount={1}
                    latest3Tickets={[
                        {
                            id: 123,
                            title: 'Single ticket',
                            lastUpdatedDatetime: oneHourAgo,
                            messageCount: 2,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                    ]}
                    resourceSourceId={123}
                    resourceSourceSetId={456}
                    dateRange={testDateRange}
                    outcomeCustomFieldId={789}
                    intentCustomFieldId={101112}
                    sectionId="related-tickets"
                    isLoading={false}
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('Single ticket')).toBeInTheDocument()
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        expect(screen.queryByText('View more')).not.toBeInTheDocument()
    })

    it('renders correctly with less than 3 tickets (2 tickets)', () => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const testDateRange = {
            start_datetime: new Date(
                Date.now() - 28 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            end_datetime: new Date().toISOString(),
        }

        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanel
                initialExpandedSections={['related-tickets']}
            >
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    ticketCount={2}
                    latest3Tickets={[
                        {
                            id: 123,
                            title: 'First ticket',
                            lastUpdatedDatetime: oneHourAgo,
                            messageCount: 2,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                        },
                        {
                            id: 456,
                            title: 'Second ticket',
                            lastUpdatedDatetime: oneHourAgo,
                            messageCount: 1,
                            aiAgentOutcome:
                                AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
                        },
                    ]}
                    resourceSourceId={123}
                    resourceSourceSetId={456}
                    dateRange={testDateRange}
                    outcomeCustomFieldId={789}
                    intentCustomFieldId={101112}
                    sectionId="related-tickets"
                    isLoading={false}
                />
            </KnowledgeEditorSidePanel>,
        )

        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('First ticket')).toBeInTheDocument()
        expect(screen.getByText('Second ticket')).toBeInTheDocument()
        expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        expect(screen.queryByText('View more')).not.toBeInTheDocument()
    })
})
