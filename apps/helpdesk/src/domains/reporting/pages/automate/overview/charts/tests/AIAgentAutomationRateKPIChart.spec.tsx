import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AIAgentAutomationRateKPIChart } from 'domains/reporting/pages/automate/overview/charts/AIAgentAutomationRateKPIChart'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import {
    AI_AGENT_AUTOMATION_RATE_LABEL,
    AI_AGENT_AUTOMATION_RATE_TOOLTIP,
} from 'pages/automate/automate-metrics/constants'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useAutomateFiltersMock = assumeMock(useAutomateFilters)

jest.mock('domains/reporting/hooks/automate/useAIAgentAutomationRateTrend')
const useAIAgentAutomationRateTrendMock = assumeMock(
    useAIAgentAutomationRateTrend,
)

jest.mock('domains/reporting/pages/common/components/MetricCard')
const MetricCardMock = assumeMock(MetricCard)

jest.mock('domains/reporting/pages/common/components/BigNumberMetric')
const BigNumberMetricMock = assumeMock(BigNumberMetric)

jest.mock('domains/reporting/pages/common/components/TrendBadge')
const TrendBadgeMock = assumeMock(TrendBadge)

describe('AIAgentAutomationRateKPIChart', () => {
    const statsFilters: StatsFilters = {
        period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day

    const mockTrendData = {
        data: {
            value: 0.4567,
            prevValue: 0.4123,
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

        useAIAgentAutomationRateTrendMock.mockReturnValue(mockTrendData)

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
        render(<AIAgentAutomationRateKPIChart />)

        expect(MetricCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: AI_AGENT_AUTOMATION_RATE_LABEL,
                hint: AI_AGENT_AUTOMATION_RATE_TOOLTIP,
            }),
            {},
        )
    })

    it('should pass correct data to useAIAgentAutomationRateTrend hook', () => {
        render(<AIAgentAutomationRateKPIChart />)

        expect(useAIAgentAutomationRateTrendMock).toHaveBeenCalledWith(
            statsFilters,
            userTimezone,
        )
    })

    it('should display loading state when fetching', () => {
        useAIAgentAutomationRateTrendMock.mockReturnValue({
            ...mockTrendData,
            isFetching: true,
        })

        render(<AIAgentAutomationRateKPIChart />)

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

    it('should format percentage value correctly', () => {
        render(<AIAgentAutomationRateKPIChart />)

        expect(screen.getByText('45.67%')).toBeInTheDocument()
    })

    it('should handle zero percentage correctly', () => {
        useAIAgentAutomationRateTrendMock.mockReturnValue({
            data: {
                value: 0,
                prevValue: 0,
            },
            isFetching: false,
            isError: false,
        })

        render(<AIAgentAutomationRateKPIChart />)

        expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle null values gracefully', () => {
        useAIAgentAutomationRateTrendMock.mockReturnValue({
            data: {
                value: 0,
                prevValue: 0,
            },
            isFetching: false,
            isError: false,
        })

        render(<AIAgentAutomationRateKPIChart />)

        expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should handle error state', () => {
        useAIAgentAutomationRateTrendMock.mockReturnValue({
            data: {
                value: 0,
                prevValue: 0,
            },
            isFetching: false,
            isError: true,
        })

        render(<AIAgentAutomationRateKPIChart />)

        expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('should pass dashboard and chartId props when provided', () => {
        const mockDashboard = { id: 'test-dashboard' }
        const mockChartId = 'test-chart-id'

        render(
            <AIAgentAutomationRateKPIChart
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

    it('should render trend badge with percentage formatting', () => {
        render(<AIAgentAutomationRateKPIChart />)

        expect(TrendBadgeMock).toHaveBeenCalledWith(
            expect.objectContaining({
                value: 45.67,
                prevValue: 41.23,
                interpretAs: 'more-is-better',
            }),
            {},
        )
    })

    it('should handle decimal values properly', () => {
        useAIAgentAutomationRateTrendMock.mockReturnValue({
            data: {
                value: 0.999,
                prevValue: 0.5,
            },
            isFetching: false,
            isError: false,
        })

        render(<AIAgentAutomationRateKPIChart />)

        expect(screen.getByText('99.9%')).toBeInTheDocument()
    })
})
