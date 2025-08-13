import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AIAgentAutomatedInteractionsKPIChart } from 'domains/reporting/pages/automate/overview/charts/AIAgentAutomatedInteractionsKPIChart'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import {
    AI_AGENT_AUTOMATED_INTERACTIONS_COUNT_LABEL,
    AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP,
} from 'pages/automate/automate-metrics/constants'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useAutomateFiltersMock = assumeMock(useAutomateFilters)

jest.mock(
    'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend',
)
const useAIAgentAutomatedInteractionsTrendMock = assumeMock(
    useAIAgentAutomatedInteractionsTrend,
)

jest.mock('domains/reporting/pages/common/components/MetricCard')
const MetricCardMock = assumeMock(MetricCard)

jest.mock('domains/reporting/pages/common/components/BigNumberMetric')
const BigNumberMetricMock = assumeMock(BigNumberMetric)

jest.mock('domains/reporting/pages/common/components/TrendBadge')
const TrendBadgeMock = assumeMock(TrendBadge)

describe('AIAgentAutomatedInteractionsKPIChart', () => {
    const statsFilters: StatsFilters = {
        period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day

    const mockTrendData = {
        data: {
            value: 1234,
            prevValue: 1000,
        },
        isFetching: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()

        useAutomateFiltersMock.mockReturnValue({
            statsFilters,
            userTimezone,
            granularity,
        })

        useAIAgentAutomatedInteractionsTrendMock.mockReturnValue(mockTrendData)

        MetricCardMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        BigNumberMetricMock.mockImplementation(({ children, trendBadge }) => (
            <div>
                {children}
                {trendBadge}
            </div>
        ))
        TrendBadgeMock.mockImplementation(() => <div>TrendBadge</div>)
    })

    it('should render with correct title and tooltip', () => {
        render(<AIAgentAutomatedInteractionsKPIChart />)

        expect(MetricCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: AI_AGENT_AUTOMATED_INTERACTIONS_COUNT_LABEL,
                hint: AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP,
            }),
            {},
        )
    })

    it('should pass correct data to useAIAgentAutomatedInteractionsTrend hook', () => {
        render(<AIAgentAutomatedInteractionsKPIChart />)

        expect(useAIAgentAutomatedInteractionsTrendMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
    })

    it('should display loading state when fetching', () => {
        useAIAgentAutomatedInteractionsTrendMock.mockReturnValue({
            ...mockTrendData,
            isFetching: true,
        })

        render(<AIAgentAutomatedInteractionsKPIChart />)

        expect(MetricCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )

        expect(BigNumberMetricMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })

    it('should format and display the metric value correctly', () => {
        render(<AIAgentAutomatedInteractionsKPIChart />)

        expect(screen.getByText('1,234')).toBeInTheDocument()
    })

    it('should handle null values gracefully', () => {
        useAIAgentAutomatedInteractionsTrendMock.mockReturnValue({
            data: {
                value: null,
                prevValue: null,
            },
            isFetching: false,
            isError: false,
        })

        render(<AIAgentAutomatedInteractionsKPIChart />)

        expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should handle error state', () => {
        useAIAgentAutomatedInteractionsTrendMock.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: true,
        } as any)

        render(<AIAgentAutomatedInteractionsKPIChart />)

        expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    it('should pass dashboard and chartId props when provided', () => {
        const mockDashboard = { id: 'test-dashboard' }
        const mockChartId = 'test-chart-id'

        render(
            <AIAgentAutomatedInteractionsKPIChart
                dashboard={mockDashboard as any}
                chartId={mockChartId}
            />,
        )

        expect(MetricCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                dashboard: mockDashboard,
                chartId: mockChartId,
            }),
            {},
        )
    })

    it('should render trend badge with correct props', () => {
        render(<AIAgentAutomatedInteractionsKPIChart />)

        expect(TrendBadgeMock).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 1234,
                prevValue: 1000,
                interpretAs: 'more-is-better',
            }),
            {},
        )
    })
})
