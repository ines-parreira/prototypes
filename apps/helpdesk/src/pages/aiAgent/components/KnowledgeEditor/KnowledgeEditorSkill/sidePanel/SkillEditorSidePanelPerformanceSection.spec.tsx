import { render, screen } from '@testing-library/react'

import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'

import { SkillEditorSidePanelPerformanceSection } from './SkillEditorSidePanelPerformanceSection'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext',
    () => ({ useSkillPerformanceFromContext: jest.fn() }),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection',
    () => ({
        KnowledgeEditorSidePanelSection: ({
            header,
            children,
        }: {
            header: { title: React.ReactNode; subtitle: React.ReactNode }
            children: React.ReactNode
        }) => (
            <div>
                <div>{header.title}</div>
                <div>{header.subtitle}</div>
                {children}
            </div>
        ),
    }),
)

jest.mock('./SkillEditorSidePanelPerformanceMetricCards', () => ({
    SkillEditorSidePanelPerformanceMetricCards: () => (
        <div>Performance metric cards</div>
    ),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase',
    () => ({
        formatDateRangeSubtitle: jest.fn((dateRange) =>
            dateRange ? 'Feb 1 – Mar 1, 2024' : 'Last 28 days',
        ),
    }),
)

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

describe('SkillEditorSidePanelPerformanceSection', () => {
    beforeEach(() => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: defaultSkillMetrics,
            recentTickets: undefined,
            historicalVersionDateRange: undefined,
        })
    })

    afterEach(() => jest.clearAllMocks())

    it('renders the performance heading with "Last 28 days" subtitle by default', () => {
        render(
            <SkillEditorSidePanelPerformanceSection sectionId="performance" />,
        )

        expect(screen.getByText('Performance')).toBeInTheDocument()
        expect(screen.getByText('Last 28 days')).toBeInTheDocument()
    })

    it('renders the formatted date range subtitle when viewing a historical version', () => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: defaultSkillMetrics,
            recentTickets: undefined,
            historicalVersionDateRange: {
                start_datetime: '2024-02-01T00:00:00Z',
                end_datetime: '2024-03-01T00:00:00Z',
            },
        })

        render(
            <SkillEditorSidePanelPerformanceSection sectionId="performance" />,
        )

        expect(screen.getByText('Feb 1 – Mar 1, 2024')).toBeInTheDocument()
        expect(screen.queryByText('Last 28 days')).not.toBeInTheDocument()
    })

    it('shows "No data yet" when there are no metrics and no recent tickets', () => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: defaultSkillMetrics,
            recentTickets: {
                ticketCount: 0,
                latest3Tickets: [],
                isLoading: false,
            },
            historicalVersionDateRange: undefined,
        })

        render(
            <SkillEditorSidePanelPerformanceSection sectionId="performance" />,
        )

        expect(screen.getByText('No data yet')).toBeInTheDocument()
        expect(
            screen.queryByText('Performance metric cards'),
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
            historicalVersionDateRange: undefined,
        })

        render(
            <SkillEditorSidePanelPerformanceSection sectionId="performance" />,
        )

        expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
    })

    it('renders metric cards when metrics data is available', () => {
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
            recentTickets: undefined,
            historicalVersionDateRange: undefined,
        })

        render(
            <SkillEditorSidePanelPerformanceSection sectionId="performance" />,
        )

        expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
        expect(screen.getByText('Performance metric cards')).toBeInTheDocument()
    })

    it('renders metric cards when there are recent tickets even without metrics', () => {
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: defaultSkillMetrics,
            recentTickets: {
                ticketCount: 3,
                latest3Tickets: [],
                isLoading: false,
            },
            historicalVersionDateRange: undefined,
        })

        render(
            <SkillEditorSidePanelPerformanceSection sectionId="performance" />,
        )

        expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
        expect(screen.getByText('Performance metric cards')).toBeInTheDocument()
    })
})
