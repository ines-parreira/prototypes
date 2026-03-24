import { useFlag } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { useListStores } from '@gorgias/helpdesk-queries'

import * as automateFiltersHooks from 'domains/reporting/hooks/automate/useAutomateFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AnalyticsOverviewConfigurableBarGraph } from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewConfigurableBarGraph/AnalyticsOverviewConfigurableBarGraph'
import { getBarChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock('@repo/feature-flags')
jest.mock('@gorgias/helpdesk-queries')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext',
    () => ({
        useDashboardContext: jest.fn().mockReturnValue(null),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewConfigurableBarGraph/DEPRECATED_AutomationRateComboChart',
    () => ({
        DEPRECATED_AutomationRateComboChart: () => <div>Deprecated chart</div>,
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getBarChartGraphConfig: jest.fn(),
}))
const getBarChartGraphConfigMock = assumeMock(getBarChartGraphConfig)
const useListStoresMock = assumeMock(useListStores)

const useFlagMocked = assumeMock(useFlag)

describe('AnalyticsOverviewConfigurableBarGraph', () => {
    const mockChartData = [
        { name: 'AI Agent', value: 18 },
        { name: 'Flows', value: 7 },
        { name: 'Article Recommendation', value: 4 },
        { name: 'Order Management', value: 3 },
    ]
    const defaultDimension = {
        id: 'automationFeatureType',
        name: 'Feature',
        configurableGraphType: ConfigurableGraphType.Donut,
        valueFormatter: (value: number) => `${value}%`,
        useChartData: jest.fn().mockReturnValue({
            data: mockChartData,
            isLoading: false,
        }),
        period: {
            start_datetime: '2024-01-01',
            end_datetime: '2024-01-31',
        },
    }
    const defaultMetricConfig: ConfigurableGraphMetricConfig = {
        measure: 'automationRate',
        name: 'Overall automation rate',
        metricFormat: 'decimal-to-percent',
        interpretAs: 'more-is-better',
        useTrendData: jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 0.32, prevValue: 0.3 },
        }),
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
        jest.spyOn(automateFiltersHooks, 'useAutomateFilters').mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useListStoresMock.mockReturnValue({ data: [] } as any)
        getBarChartGraphConfigMock.mockReturnValue([defaultMetricConfig])

        useFlagMocked.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render the metric value from automation rate hook', () => {
        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AnalyticsOverviewConfigurableBarGraph />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AnalyticsOverviewConfigurableBarGraph />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should not render select dropdown when only one metric', () => {
        render(<AnalyticsOverviewConfigurableBarGraph />)

        const selectButtons = screen.queryAllByRole('button', {
            name: /Overall automation rate/i,
        })
        const hasDropdown = selectButtons.some((button) =>
            button.getAttribute('aria-expanded'),
        )
        expect(hasDropdown).toBe(false)
    })

    it('should render all legend items', () => {
        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Flows')).toBeInTheDocument()
        expect(screen.getByText('Article Recommendation')).toBeInTheDocument()
        expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it('should render legend percentages from chart data', () => {
        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getAllByText('56.25%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('21.88%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('12.50%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('9.38%').length).toBeGreaterThan(0)
    })

    it('should render responsive container for donut chart', () => {
        const { container } = render(<AnalyticsOverviewConfigurableBarGraph />)

        const responsiveContainer = container.querySelector(
            '.recharts-responsive-container',
        )
        expect(responsiveContainer).toBeInTheDocument()
    })

    it('should render with negative trend icon when trend is negative', () => {
        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                useTrendData: jest.fn().mockReturnValue({
                    isFetching: false,
                    isError: false,
                    data: {
                        value: 0.28,
                        prevValue: 0.3,
                    },
                }),
            },
        ])

        const { container } = render(<AnalyticsOverviewConfigurableBarGraph />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render legend items as interactive buttons', () => {
        render(<AnalyticsOverviewConfigurableBarGraph />)

        const legendButtons = screen.getAllByRole('button', {
            name: /AI Agent|Flows|Article Recommendation|Order Management/,
        })
        expect(legendButtons.length).toBe(4)
    })

    it('should toggle legend item visibility when clicked', async () => {
        render(<AnalyticsOverviewConfigurableBarGraph />)

        const aiAgentButton = screen.getByRole('button', {
            name: /AI Agent/,
        })

        expect(aiAgentButton).toBeInTheDocument()

        await act(async () => {
            await userEvent.click(aiAgentButton)
        })

        expect(aiAgentButton).toBeInTheDocument()
    })

    it('should pass stores from useListStores to getBarChartGraphConfig', () => {
        const mockStores = [
            {
                store_integration_id: 123,
                name: 'my-store',
                created_datetime: '2025-01-01T00:00:00Z',
            },
        ]
        useListStoresMock.mockReturnValue({ data: mockStores } as any)

        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(getBarChartGraphConfigMock).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            { stores: mockStores },
        )
    })

    it('should render loading skeleton when data is loading', () => {
        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                dimensions: [
                    {
                        ...defaultDimension,
                        useChartData: jest
                            .fn()
                            .mockReturnValue({ data: [], isLoading: true }),
                    },
                ],
            },
        ])

        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render loading skeleton when automation rate is fetching', () => {
        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                useTrendData: jest.fn().mockReturnValue({
                    data: undefined,
                    isFetching: true,
                }),
            },
        ])

        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should filter out chart data items with value 0', () => {
        const mockDataWithZero = [
            { name: 'AI Agent', value: 18 },
            { name: 'Flows', value: 0 },
            { name: 'Article Recommendation', value: 4 },
        ]

        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                dimensions: [
                    {
                        ...defaultDimension,
                        useChartData: jest.fn().mockReturnValue({
                            data: mockDataWithZero,
                            isLoading: false,
                        }),
                    },
                ],
            },
        ])

        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        expect(screen.getByText('Article Recommendation')).toBeInTheDocument()
    })

    it('should handle null automation rate value', () => {
        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                useTrendData: jest.fn().mockReturnValue({
                    data: {
                        value: null,
                        prevValue: null,
                    },
                    isLoading: false,
                }),
            },
        ])

        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render empty chart when chart data is empty array', () => {
        getBarChartGraphConfigMock.mockReturnValue([
            {
                ...defaultMetricConfig,
                dimensions: [
                    {
                        ...defaultDimension,
                        useChartData: jest
                            .fn()
                            .mockReturnValue({ data: [], isLoading: false }),
                    },
                ],
            },
        ])

        render(<AnalyticsOverviewConfigurableBarGraph />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })
})
