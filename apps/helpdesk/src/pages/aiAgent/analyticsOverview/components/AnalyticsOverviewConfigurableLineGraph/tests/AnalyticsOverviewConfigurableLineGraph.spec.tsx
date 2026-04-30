import { useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useListStores } from '@gorgias/helpdesk-queries'

import { ReportingGranularity } from 'domains/reporting/models/types'
import * as aiAgentStatsFiltersHooks from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { AnalyticsOverviewConfigurableLineGraph } from '../AnalyticsOverviewConfigurableLineGraph'

jest.mock('@repo/feature-flags')
jest.mock('@gorgias/helpdesk-queries')
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
jest.mock(
    'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewConfigurableLineGraph/DEPRECATED_AutomationLineChart',
    () => ({
        DEPRECATED_AutomationLineChart: () => <div>Deprecated chart</div>,
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getLineChartGraphConfig: jest.fn(),
}))
const getLineChartGraphConfigMock = assumeMock(getLineChartGraphConfig)
const useListStoresMock = assumeMock(useListStores)

const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)

describe('AnalyticsOverviewConfigurableLineGraph', () => {
    const mockTimeSeriesData = [
        { date: 'Jun 1 2024', value: 0.3 },
        { date: 'Jun 2 2024', value: 0.28 },
        { date: 'Jun 3 2024', value: 0.32 },
    ]

    const defaultDimension = {
        id: 'overall',
        name: 'Overall',
        configurableGraphType: ConfigurableGraphType.TimeSeries,
        useChartData: jest.fn().mockReturnValue({
            data: mockTimeSeriesData,
            isLoading: false,
        }),
    }

    const defaultMetricConfig: ConfigurableGraphMetricConfig = {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent',
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
        jest.spyOn(
            aiAgentStatsFiltersHooks,
            'useAiAgentStatsFilters',
        ).mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-06-01',
                    end_datetime: '2024-06-07',
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
        render(<AnalyticsOverviewConfigurableLineGraph />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should not render a trend badge', () => {
        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(false)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(<AnalyticsOverviewConfigurableLineGraph />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should pass stores from useListStores to getLineChartGraphConfig', () => {
        const mockStores = [
            {
                store_integration_id: 123,
                name: 'my-store',
                created_datetime: '2025-01-01T00:00:00Z',
            },
        ]
        useListStoresMock.mockReturnValue({ data: mockStores } as any)

        render(<AnalyticsOverviewConfigurableLineGraph />)

        expect(getLineChartGraphConfigMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.anything(),
            { stores: mockStores },
        )
    })
})
