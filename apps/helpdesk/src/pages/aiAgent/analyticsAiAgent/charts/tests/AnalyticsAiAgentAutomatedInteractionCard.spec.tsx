import { useFlag } from '@repo/feature-flags'
import { screen, waitFor } from '@testing-library/react'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { AnalyticsAiAgentAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomatedInteractionCard'
import { useAiAgentAutomatedInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsMetric'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsDrillDown:
            'ai-agent-analytics-dashboards-drilldown',
    },
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

jest.mock('domains/reporting/hooks/drill-down/useDrillDownModalTrigger')
const mockUseDrillDownModalTrigger = jest.mocked(useDrillDownModalTrigger)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAutomatedInteractionsMetric',
)
const mockUseAiAgentAutomatedInteractionsMetric = jest.mocked(
    useAiAgentAutomatedInteractionsMetric,
)

describe('AnalyticsAiAgentAutomatedInteractionsCard', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-06-25T00:00:00.000Z',
            end_datetime: '2024-07-01T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        mockUseAiAgentAutomatedInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 6200,
                prevValue: null,
            },
        })

        mockUseDrillDownModalTrigger.mockReturnValue({
            openDrillDownModal: jest.fn(),
            tooltipText: 'Click to view tickets',
        })

        mockUseFlag.mockReturnValue(true)
    })

    it('should render loading state initially', () => {
        mockUseAiAgentAutomatedInteractionsMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted number', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should display trend badge with previous value', async () => {
        mockUseAiAgentAutomatedInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 6200,
                prevValue: 6000,
            },
        })

        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('200')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
        })
    })

    it('should handle different period for tooltip', async () => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                ...mockFilters,
                period: {
                    start_datetime: '2024-01-01T00:00:00.000Z',
                    end_datetime: '2024-01-01T23:59:59.999Z',
                },
            },
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard
                chartId="test-chart-id"
                dashboard={{
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: 1,
                    children: [],
                    emoji: '🚀',
                }}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
        })
    })

    it('should pass drillDown prop to TrendCard', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AiAgentDrillDownMetricName.AutomatedInteractionsCard,
            title: 'Automated interactions',
        })
    })

    it('should not pass drillDown to TrendCard when feature flag is disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalled()
        expect(
            screen.queryByRole('button', { name: /view tickets/i }),
        ).not.toBeInTheDocument()
    })

    it('should not pass drillDown to TrendCard when metric value is 0', async () => {
        mockUseAiAgentAutomatedInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                label: 'Automated interactions',
                value: 0,
                prevValue: null,
            },
        })

        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalled()
        expect(
            screen.queryByRole('button', { name: /view tickets/i }),
        ).not.toBeInTheDocument()
    })
})
