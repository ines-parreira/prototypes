import { useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { ChartConfig } from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'

import { AnalyticsAiAgentAutomationRateCard } from '../AnalyticsAiAgentAutomationRateCard'

jest.mock('domains/reporting/hooks/automate/useAIAgentAutomationRateTrend')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown')
jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        AiAgentAnalyticsDashboardsTrendCardsWithTimeseries:
            'ai-agent-analytics-dashboards-trend-cards-with-timeseries',
    },
    useFlagWithLoading: jest.fn(),
}))

const mockUseAIAgentAutomationRateTrend = assumeMock(
    useAIAgentAutomationRateTrend,
)
const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseFlagWithLoading = assumeMock(useFlagWithLoading)
const mockUseAiAgentTrendCardDrillDown = assumeMock(
    useAiAgentTrendCardDrillDown,
)

const chartConfig: ChartConfig = {
    chartComponent: jest.fn(),
    label: 'Automation rate',
    description:
        'The percentage of customer interactions fully handled by the AI Agent.',
    csvProducer: null,
    chartType: ChartType.Card,
    metricFormat: 'decimal-to-percent',
    interpretAs: 'more-is-better',
}

describe('AnalyticsAiAgentAutomationRateCard', () => {
    beforeAll(() => {
        Element.prototype.getAnimations = function () {
            return []
        }
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        mockUseAiAgentTrendCardDrillDown.mockReturnValue(undefined)

        mockUseAIAgentAutomationRateTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 0.125, prevValue: 0.1 },
        })
    })

    it('should render the metric title', () => {
        render(<AnalyticsAiAgentAutomationRateCard chartConfig={chartConfig} />)

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should render the metric value', () => {
        render(<AnalyticsAiAgentAutomationRateCard chartConfig={chartConfig} />)

        expect(screen.getByText('12.5%')).toBeInTheDocument()
    })

    it('should render loading skeleton when fetching', () => {
        mockUseAIAgentAutomationRateTrend.mockReturnValue({
            isFetching: true,
            isError: false,
        })

        render(<AnalyticsAiAgentAutomationRateCard chartConfig={chartConfig} />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render with positive trend when value increased', () => {
        const { container } = render(
            <AnalyticsAiAgentAutomationRateCard chartConfig={chartConfig} />,
        )

        const icons = container.querySelectorAll('svg')
        const hasTrendingUpIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending-up'),
        )
        expect(hasTrendingUpIcon).toBe(true)
    })

    it('should render with negative trend when value decreased', () => {
        mockUseAIAgentAutomationRateTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 0.08, prevValue: 0.1 },
        })

        const { container } = render(
            <AnalyticsAiAgentAutomationRateCard chartConfig={chartConfig} />,
        )

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should call useAIAgentAutomationRateTrend with period-only filters', () => {
        render(<AnalyticsAiAgentAutomationRateCard chartConfig={chartConfig} />)

        expect(mockUseAIAgentAutomationRateTrend).toHaveBeenCalledWith(
            {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            'UTC',
        )
    })
})
