import { useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useListStores } from '@gorgias/helpdesk-queries'

import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AnalyticsShoppingAssistantConfigurableLine } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsShoppingAssistantConfigurableLine/AnalyticsShoppingAssistantConfigurableLine'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock('@gorgias/helpdesk-queries')
jest.mock('@repo/feature-flags')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock('../DEPRECATED_AnalyticsShoppingAssistantLineChart', () => ({
    DEPRECATED_AnalyticsShoppingAssistantLineChart: () => (
        <div>Deprecated chart</div>
    ),
}))
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getLineChartGraphConfig: jest.fn(),
}))
const getLineChartGraphConfigMock = assumeMock(getLineChartGraphConfig)
const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)
const useListStoresMock = assumeMock(useListStores)

describe('AnalyticsShoppingAssistantConfigurableLine', () => {
    const mockChartData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 120 },
    ]

    const defaultDimension = {
        id: 'overall',
        name: 'Overall',
        configurableGraphType: ConfigurableGraphType.TimeSeries,
        useChartData: jest.fn().mockReturnValue({
            data: mockChartData,
            isLoading: false,
        }),
    }

    const defaultMetricConfig: ConfigurableGraphMetricConfig = {
        measure: 'automatedInteractionsCount',
        name: 'Automated interactions',
        metricFormat: 'decimal',
        interpretAs: 'more-is-better',
        dimensions: [defaultDimension],
    }

    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        Element.prototype.getAnimations = function () {
            return []
        }
    })

    beforeEach(() => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        useListStoresMock.mockReturnValue({ data: [] } as any)
        getLineChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
        useFlagWithLoadingMocked.mockReturnValue({
            value: true,
            isLoading: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AnalyticsShoppingAssistantConfigurableLine />)

        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
    })

    it('should not render a trend badge', () => {
        const { container } = render(
            <AnalyticsShoppingAssistantConfigurableLine />,
        )

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(false)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(
            <AnalyticsShoppingAssistantConfigurableLine />,
        )

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render metric selector when multiple metrics are present', () => {
        const secondMetricConfig: ConfigurableGraphMetricConfig = {
            ...defaultMetricConfig,
            measure: 'totalSalesAmount',
            name: 'Total sales',
        }
        getLineChartGraphConfigMock.mockReturnValue([
            defaultMetricConfig,
            secondMetricConfig,
        ])

        render(<AnalyticsShoppingAssistantConfigurableLine />)

        expect(
            screen.getByRole('button', { name: /automated interactions/i }),
        ).toBeInTheDocument()
    })

    it('should render deprecated chart when feature flag is disabled', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<AnalyticsShoppingAssistantConfigurableLine />)

        expect(screen.getByText('Deprecated chart')).toBeInTheDocument()
    })
})
