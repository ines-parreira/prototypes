import type { ReactNode } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSkillEventMarkers } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillEventMarkers'
import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { useSkillPerformanceTrendFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceTrendFromContext'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'

import { SkillEditorSidePanelPerformanceTab } from './SkillEditorSidePanelPerformanceTab'

jest.mock('@repo/feature-flags')

Element.prototype.getAnimations = jest.fn(() => [])

const mockComposedMetricTimeSeriesChart = jest.fn((__props: unknown) => (
    <div data-testid="skill-performance-chart">Skill performance chart</div>
))
const mockChartCard = jest.fn(({ children }: { children: ReactNode }) => (
    <div data-testid="skill-performance-chart-card">{children}</div>
))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext',
    () => ({
        SkillPerformanceDataProvider: ({
            children,
        }: {
            children: ReactNode
        }) => <>{children}</>,
        useSkillPerformanceFromContext: jest.fn(),
        useSkillPerformanceDataContext: jest.fn(() => ({
            skillMetrics: { resourceSourceId: 42 },
        })),
    }),
)
jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceTrendFromContext',
    () => ({
        useSkillPerformanceTrendFromContext: jest.fn(),
    }),
)
jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillEventMarkers',
    () => ({
        useSkillEventMarkers: jest.fn(() => ({
            markers: [],
            isLoading: false,
        })),
    }),
)

jest.mock('@repo/reporting', () => ({
    ChartCard: (props: { children: ReactNode }) => mockChartCard(props),
    ComposedMetricTimeSeriesChart: (props: unknown) =>
        mockComposedMetricTimeSeriesChart(props),
    NoDataPlaceholder: () => <div>No data found</div>,
    TrendBadge: () => null,
}))

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
const mockUseSkillPerformanceTrendFromContext =
    useSkillPerformanceTrendFromContext as jest.Mock
const mockUseSkillEventMarkers = useSkillEventMarkers as jest.Mock

const defaultSkillMetrics = {
    metrics: null,
    isLoading: false,
    resourceSourceId: 0,
    shopIntegrationId: 0,
    dateRange: { start_datetime: '2024-01-01', end_datetime: '2024-01-28' },
    totalAiAgentTickets: 0,
}
const defaultTrendChartData = [
    { date: '2026-04-20', ticketVolume: 34, csat: 4.3 },
    { date: '2026-05-17', ticketVolume: 99, csat: 4.5 },
]
const defaultEventMarkers = [
    {
        id: 'skill-version-1',
        date: '2026-04-30',
        label: 'Changes published',
    },
]

describe('SkillEditorSidePanelPerformanceTab', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFeatureFlags({})
        mockUseSkillPerformanceFromContext.mockReturnValue({
            skillMetrics: defaultSkillMetrics,
            recentTickets: undefined,
        })
        mockUseSkillPerformanceTrendFromContext.mockReturnValue({
            chartData: defaultTrendChartData,
            dateRange: defaultSkillMetrics.dateRange,
            isLoading: false,
        })
        mockUseSkillEventMarkers.mockReturnValue({
            markers: defaultEventMarkers,
            isLoading: false,
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

    it('hides the Explore trend button when the new reporting layer flag is off', () => {
        render(<SkillEditorSidePanelPerformanceTab />)

        expect(
            screen.queryByRole('button', { name: 'Explore trend' }),
        ).not.toBeInTheDocument()
    })

    it('opens the Skill performance modal from the Explore trend button when the new reporting layer flag is on', async () => {
        const user = userEvent.setup()

        mockFeatureFlags({
            [FeatureFlagKey.IntentBasedKnowledgeMilestone3NewReportingLayer]: true,
        })

        render(<SkillEditorSidePanelPerformanceTab />)

        expect(
            screen.getByRole('button', { name: 'Explore trend' }),
        ).toBeInTheDocument()
        expect(mockComposedMetricTimeSeriesChart).not.toHaveBeenCalled()
        expect(mockUseSkillPerformanceTrendFromContext).not.toHaveBeenCalled()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: 'Explore trend' }),
            )
        })

        expect(screen.getByText('Skill performance')).toBeInTheDocument()
        expect(mockUseSkillPerformanceTrendFromContext).toHaveBeenCalled()
        expect(
            screen.getByTestId('skill-performance-chart-card'),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('skill-performance-chart'),
        ).toBeInTheDocument()
        expect(mockChartCard).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'CSAT',
                withTrend: false,
            }),
        )
        expect(mockComposedMetricTimeSeriesChart).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.arrayContaining([
                    {
                        date: '2026-04-20',
                        ticketVolume: 34,
                        csat: 4.3,
                    },
                    {
                        date: '2026-05-17',
                        ticketVolume: 99,
                        csat: 4.5,
                    },
                ]),
                markers: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'skill-version-1',
                        date: '2026-04-30',
                        label: 'Changes published',
                    }),
                ]),
                barMetric: expect.objectContaining({
                    dataKey: 'ticketVolume',
                    label: 'Tickets',
                    color: 'var(--dataviz-coral)',
                    yAxisDomain: [0, 200],
                }),
                lineMetric: expect.objectContaining({
                    dataKey: 'csat',
                    label: 'CSAT',
                    color: 'var(--dataviz-purple)',
                }),
                chartHeight: 262,
                isLoading: false,
                legendGap: 36,
            }),
        )

        const chartProps = mockComposedMetricTimeSeriesChart.mock
            .calls[0][0] as {
            data: unknown[]
            dateFormatter: (date: string) => string
        }

        expect(chartProps.data).toHaveLength(defaultTrendChartData.length)
        expect(chartProps.dateFormatter('2026-04-20')).toBe(
            new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
            }).format(new Date(2026, 3, 20)),
        )
    })

    it('shows a no-data placeholder in the trend modal when chart data is empty', async () => {
        const user = userEvent.setup()

        mockFeatureFlags({
            [FeatureFlagKey.IntentBasedKnowledgeMilestone3NewReportingLayer]: true,
        })
        mockUseSkillPerformanceTrendFromContext.mockReturnValue({
            chartData: [],
            dateRange: defaultSkillMetrics.dateRange,
            isLoading: false,
        })

        render(<SkillEditorSidePanelPerformanceTab />)

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: 'Explore trend' }),
            )
        })

        expect(screen.getByText('No data found')).toBeInTheDocument()
        expect(mockComposedMetricTimeSeriesChart).not.toHaveBeenCalled()
    })
})
