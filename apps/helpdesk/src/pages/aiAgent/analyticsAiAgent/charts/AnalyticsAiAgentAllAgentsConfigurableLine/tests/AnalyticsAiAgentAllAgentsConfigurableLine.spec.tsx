import { useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    getLineChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { AnalyticsAiAgentAllAgentsConfigurableLine } from '../AnalyticsAiAgentAllAgentsConfigurableLine'

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
jest.mock(
    'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsConfigurableLine/DEPRECATED_AIAgentAutomationLineChart',
    () => ({
        DEPRECATED_AIAgentAutomationLineChart: () => (
            <div>Deprecated chart</div>
        ),
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getLineChartGraphConfig: jest.fn(),
    useStoreIntegrations: jest.fn(),
}))
const getLineChartGraphConfigMock = assumeMock(getLineChartGraphConfig)
const useStoreIntegrationsMock = assumeMock(useStoreIntegrations)
const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)

describe('AnalyticsAiAgentAllAgentsConfigurableLine', () => {
    const mockChartData = [
        { date: '2024-01-01', value: 0.3 },
        { date: '2024-01-02', value: 0.32 },
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
        measure: 'automationRate',
        name: 'AI Agent automation rate',
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
        getLineChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
        useStoreIntegrationsMock.mockReturnValue([])
        useFlagWithLoadingMocked.mockReturnValue({
            value: true,
            isLoading: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should pass stores from useStoreIntegrations to getLineChartGraphConfig', () => {
        const mockStores = [
            { store_integration_id: 1, name: 'My Store' },
        ] as any
        useStoreIntegrationsMock.mockReturnValue(mockStores)

        render(<AnalyticsAiAgentAllAgentsConfigurableLine />)

        expect(getLineChartGraphConfigMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            expect.anything(),
            { stores: mockStores },
        )
    })

    it('should render the metric title', () => {
        render(<AnalyticsAiAgentAllAgentsConfigurableLine />)

        expect(screen.getByText('AI Agent automation rate')).toBeInTheDocument()
    })

    it('should not render a trend badge', () => {
        const { container } = render(
            <AnalyticsAiAgentAllAgentsConfigurableLine />,
        )

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(false)
    })

    it('should render responsive container for chart', () => {
        const { container } = render(
            <AnalyticsAiAgentAllAgentsConfigurableLine />,
        )

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render metric selector when multiple metrics are present', () => {
        const secondMetricConfig: ConfigurableGraphMetricConfig = {
            ...defaultMetricConfig,
            measure: 'automatedInteractionsCount',
            name: 'Automated interactions',
        }
        getLineChartGraphConfigMock.mockReturnValue([
            defaultMetricConfig,
            secondMetricConfig,
        ])

        render(<AnalyticsAiAgentAllAgentsConfigurableLine />)

        expect(
            screen.getByRole('button', { name: /ai agent automation rate/i }),
        ).toBeInTheDocument()
    })

    it('should render deprecated chart when feature flag is disabled', () => {
        useFlagWithLoadingMocked.mockReturnValue({
            value: false,
            isLoading: false,
        })

        render(<AnalyticsAiAgentAllAgentsConfigurableLine />)

        expect(screen.getByText('Deprecated chart')).toBeInTheDocument()
    })
})
