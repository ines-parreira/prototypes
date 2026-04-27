import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'

import { SkillEditorSidePanelPerformanceTab } from './SkillEditorSidePanelPerformanceTab'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext',
    () => ({ useSkillPerformanceFromContext: jest.fn() }),
)

jest.mock('./SkillEditorSidePanelRecentTicketsSection', () => ({
    SkillEditorSidePanelRecentTicketsSection: () => (
        <div>Recent tickets section</div>
    ),
}))

jest.mock('./SkillEditorSidePanelPerformanceMetricCards', () => ({
    SkillEditorSidePanelPerformanceMetricCards: () => (
        <div>Performance metric cards</div>
    ),
}))

const mockUseSkillPerformanceFromContext =
    useSkillPerformanceFromContext as jest.Mock

const defaultSkillMetrics = {
    metrics: null,
    isLoading: false,
    resourceSourceId: 0,
    shopIntegrationId: 0,
    dateRange: { start_datetime: '2024-01-01', end_datetime: '2024-01-28' },
    totalAiAgentTickets: 0,
}

describe('SkillEditorSidePanelPerformanceTab', () => {
    beforeEach(() => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: defaultSkillMetrics,
            recentTickets: undefined,
        })
    })

    it('renders the performance heading', () => {
        render(<SkillEditorSidePanelPerformanceTab />)

        expect(screen.getByText('Performance')).toBeInTheDocument()
        expect(screen.getByText('Last 28 days')).toBeInTheDocument()
    })

    it('shows "No data yet" when there are no metrics and no recent tickets', () => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: defaultSkillMetrics,
            recentTickets: {
                ticketCount: 0,
                latest3Tickets: [],
                isLoading: false,
            },
        })

        render(<SkillEditorSidePanelPerformanceTab />)

        expect(screen.getByText('No data yet')).toBeInTheDocument()
        expect(
            screen.queryByText('Performance metric cards'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Recent tickets section'),
        ).not.toBeInTheDocument()
    })

    it('does not show "No data yet" while loading', () => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: { ...defaultSkillMetrics, isLoading: true },
            recentTickets: {
                ticketCount: 0,
                latest3Tickets: [],
                isLoading: true,
            },
        })

        render(<SkillEditorSidePanelPerformanceTab />)

        expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
    })

    it('renders metric cards and recent tickets when data is available', () => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: {
                ...defaultSkillMetrics,
                metrics: {
                    tickets: 10,
                    handoverTickets: 2,
                    csat: 4.5,
                    resourceSourceSetId: 1,
                },
            },
            recentTickets: {
                ticketCount: 5,
                latest3Tickets: [],
                isLoading: false,
            },
        })

        render(<SkillEditorSidePanelPerformanceTab />)

        expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
        expect(screen.getByText('Performance metric cards')).toBeInTheDocument()
        expect(screen.getByText('Recent tickets section')).toBeInTheDocument()
    })
})
