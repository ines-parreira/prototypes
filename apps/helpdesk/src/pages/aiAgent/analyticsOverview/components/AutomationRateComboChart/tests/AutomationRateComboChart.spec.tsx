import { useFlag } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AutomationRateComboChart } from 'pages/aiAgent/analyticsOverview/components/AutomationRateComboChart/AutomationRateComboChart'
import { getBarChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock('@repo/feature-flags')
jest.mock(
    'pages/aiAgent/analyticsOverview/components/AutomationRateComboChart/DEPRECATED_AutomationRateComboChart',
    () => ({
        DEPRECATED_AutomationRateComboChart: () => <div>Deprecated chart</div>,
    }),
)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
    () => ({
        ChartsActionMenu: () => (
            <div aria-label="charts-action-menu">Charts Action Menu</div>
        ),
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    getBarChartGraphConfig: jest.fn(),
}))
const getBarChartGraphConfigMock = assumeMock(getBarChartGraphConfig)

const useFlagMocked = assumeMock(useFlag)

describe('AutomationChart', () => {
    const mockChartData = [
        { name: 'AI Agent', value: 18 },
        { name: 'Flows', value: 7 },
        { name: 'Article Recommendation', value: 4 },
        { name: 'Order Management', value: 3 },
    ]
    const defaultDimension = {
        id: 'automationFeatureType',
        name: 'Feature',
        chartType: ConfigurableGraphType.Donut,
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

        getBarChartGraphConfigMock.mockReturnValue([defaultMetricConfig])

        useFlagMocked.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render the metric title', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render the metric value from automation rate hook', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getByText('32%')).toBeInTheDocument()
    })

    it('should render the trend badge', () => {
        const { container } = render(<AutomationRateComboChart />)

        const trendBadge = container.querySelector('.trend')
        expect(trendBadge).toBeInTheDocument()
    })

    it('should render with positive trend icon', () => {
        const { container } = render(<AutomationRateComboChart />)

        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(true)
    })

    it('should not render select dropdown when only one metric', () => {
        render(<AutomationRateComboChart />)

        const selectButtons = screen.queryAllByRole('button', {
            name: /Overall automation rate/i,
        })
        const hasDropdown = selectButtons.some((button) =>
            button.getAttribute('aria-expanded'),
        )
        expect(hasDropdown).toBe(false)
    })

    it('should render all legend items', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Flows')).toBeInTheDocument()
        expect(screen.getByText('Article Recommendation')).toBeInTheDocument()
        expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    it('should render legend percentages from chart data', () => {
        render(<AutomationRateComboChart />)

        expect(screen.getAllByText('56.25%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('21.88%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('12.50%').length).toBeGreaterThan(0)
        expect(screen.getAllByText('9.38%').length).toBeGreaterThan(0)
    })

    it('should render responsive container for donut chart', () => {
        const { container } = render(<AutomationRateComboChart />)

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

        const { container } = render(<AutomationRateComboChart />)

        const trendingDownIcon = container.querySelector(
            '[aria-label="trending-down"]',
        )
        expect(trendingDownIcon).toBeInTheDocument()
    })

    it('should render legend items as interactive buttons', () => {
        render(<AutomationRateComboChart />)

        const legendButtons = screen.getAllByRole('button', {
            name: /AI Agent|Flows|Article Recommendation|Order Management/,
        })
        expect(legendButtons.length).toBe(4)
    })

    it('should toggle legend item visibility when clicked', async () => {
        render(<AutomationRateComboChart />)

        const aiAgentButton = screen.getByRole('button', {
            name: /AI Agent/,
        })

        expect(aiAgentButton).toBeInTheDocument()

        await act(async () => {
            await userEvent.click(aiAgentButton)
        })

        expect(aiAgentButton).toBeInTheDocument()
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

        render(<AutomationRateComboChart />)

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

        render(<AutomationRateComboChart />)

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

        render(<AutomationRateComboChart />)

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

        render(<AutomationRateComboChart />)

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

        render(<AutomationRateComboChart />)

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render the deprecated chart when the feature flag is off', () => {
        useFlagMocked.mockReturnValue(false)
        render(<AutomationRateComboChart />)

        expect(screen.getByText('Deprecated chart')).toBeInTheDocument()
    })

    describe('ChartsActionMenu', () => {
        const mockChartConfig = { label: 'Automation Rate' } as Parameters<
            typeof AutomationRateComboChart
        >[0]['chartConfig']

        it('should render ChartsActionMenu when chartId and chartConfig are provided', () => {
            render(
                <AutomationRateComboChart
                    chartId="automation-rate"
                    chartConfig={mockChartConfig}
                />,
            )

            expect(
                screen.getByLabelText('charts-action-menu'),
            ).toBeInTheDocument()
        })

        it('should not render ChartsActionMenu when chartId is not provided', () => {
            render(<AutomationRateComboChart chartConfig={mockChartConfig} />)

            expect(
                screen.queryByLabelText('charts-action-menu'),
            ).not.toBeInTheDocument()
        })

        it('should not render ChartsActionMenu when chartConfig is not provided', () => {
            render(<AutomationRateComboChart chartId="automation-rate" />)

            expect(
                screen.queryByLabelText('charts-action-menu'),
            ).not.toBeInTheDocument()
        })
    })
})
