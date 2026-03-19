import { useFlag } from '@repo/feature-flags'
import { screen, waitFor } from '@testing-library/react'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { AnalyticsAiAgentSupportInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportInteractionsCard'
import { useAiAgentSupportInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportInteractionsMetric'
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
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportInteractionsMetric',
)
const mockUseAiAgentSupportInteractionsMetric = jest.mocked(
    useAiAgentSupportInteractionsMetric,
)

describe('AnalyticsAiAgentSupportInteractionsCard', () => {
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

        mockUseAiAgentSupportInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            isFieldsAvailable: true,
            data: {
                label: 'Automated interactions',
                value: 3900,
                prevValue: 3600,
            },
        })

        mockUseDrillDownModalTrigger.mockReturnValue({
            openDrillDownModal: jest.fn(),
            tooltipText: 'Click to view tickets',
        })

        mockUseFlag.mockReturnValue(true)
    })

    it('should render loading state initially', () => {
        mockUseAiAgentSupportInteractionsMetric.mockReturnValue({
            isFetching: true,
            isError: false,
            isFieldsAvailable: true,
            data: undefined,
        })

        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted number', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('3,900')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should render hint tooltip icon', () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('3,900')).toBeInTheDocument()
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
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard
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
            expect(screen.getByText('3,900')).toBeInTheDocument()
        })
    })

    it('should display trend badge with previous value', async () => {
        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('3,900')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('300')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })

    it('should pass drillDown prop to TrendCard', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })

        expect(mockUseDrillDownModalTrigger).toHaveBeenCalledWith({
            metricName: AiAgentDrillDownMetricName.SupportInteractionsCard,
            title: 'Automated interactions',
        })
    })

    it('should not pass drillDown to TrendCard when feature flag is disabled', async () => {
        mockUseFlag.mockReturnValue(false)

        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
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
        mockUseAiAgentSupportInteractionsMetric.mockReturnValue({
            isFetching: false,
            isError: false,
            isFieldsAvailable: true,
            data: {
                label: 'Automated interactions',
                value: 0,
                prevValue: 0,
            },
        })

        renderWithQueryClientProvider(
            <AnalyticsAiAgentSupportInteractionsCard />,
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
