import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useStatsMetricBreakdownPerDimension } from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { PerformanceOverviewConfigurableBarGraph } from 'domains/reporting/pages/performance/overview/charts/configurableGraphs/PerformanceOverviewConfigurableBarGraph/PerformanceOverviewConfigurableBarGraph'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricBreakdownPerDimension')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useStatsMetricBreakdownPerDimensionMock = assumeMock(
    useStatsMetricBreakdownPerDimension,
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

const chartConfig: ChartConfig = {
    chartComponent: () => <div />,
    label: 'Configurable bar graph',
    csvProducer: null,
    chartType: ChartType.Graph,
}

const dashboard: DashboardSchema = {
    id: 1,
    name: 'My dashboard',
    analytics_filter_id: null,
    children: [],
    emoji: null,
}

describe('PerformanceOverviewConfigurableBarGraph', () => {
    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            callback: ResizeObserverCallback
            constructor(callback: ResizeObserverCallback) {
                this.callback = callback
            }
            observe(target: Element) {
                this.callback(
                    [
                        {
                            target,
                            contentRect: {
                                width: 500,
                                height: 300,
                            } as DOMRectReadOnly,
                            borderBoxSize: [],
                            contentBoxSize: [],
                            devicePixelContentBoxSize: [],
                        },
                    ],
                    this,
                )
            }
            unobserve() {}
            disconnect() {}
        }
        Element.prototype.getAnimations = function () {
            return []
        }
    })

    const findSvgTextByContent = (container: HTMLElement, text: string) =>
        Array.from(container.querySelectorAll('svg text')).find((el) =>
            el.textContent?.includes(text),
        )

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: undefined,
        } as any)

        useStatsMetricBreakdownPerDimensionMock.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    { dimension: 'email', value: 4.5, decile: null },
                    { dimension: 'chat', value: 4.7, decile: null },
                ],
            },
            isFetching: false,
            isError: false,
        })

        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the first metric title', () => {
        render(
            <PerformanceOverviewConfigurableBarGraph chartId="performance-overview-configurable-bar-graph" />,
        )

        expect(screen.getAllByText('Resolution time').length).toBeGreaterThan(0)
    })

    it('renders the metric selector with all four measures available', () => {
        render(
            <PerformanceOverviewConfigurableBarGraph chartId="performance-overview-configurable-bar-graph" />,
        )

        expect(
            screen.getByRole('button', { name: /Resolution time/i }),
        ).toBeInTheDocument()
        expect(
            screen.getAllByText('First response time').length,
        ).toBeGreaterThan(0)
        expect(
            screen.getAllByText('Messages per ticket').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Average CSAT').length).toBeGreaterThan(0)
    })

    it('renders humanized channel labels from the per-channel data', () => {
        const { container } = render(
            <PerformanceOverviewConfigurableBarGraph chartId="performance-overview-configurable-bar-graph" />,
        )

        expect(findSvgTextByContent(container, 'Email')).toBeTruthy()
        expect(findSvgTextByContent(container, 'Chat')).toBeTruthy()
    })

    it('renders the responsive chart container', () => {
        const { container } = render(
            <PerformanceOverviewConfigurableBarGraph chartId="performance-overview-configurable-bar-graph" />,
        )

        expect(
            container.querySelector('.recharts-responsive-container'),
        ).toBeInTheDocument()
    })

    describe('action menu', () => {
        it('renders the action menu when both chartId and chartConfig are provided', () => {
            render(
                <PerformanceOverviewConfigurableBarGraph
                    chartId="performance-overview-configurable-bar-graph"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                />,
            )

            expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
            expect(ChartsActionMenuMock.mock.calls[0][0]).toEqual(
                expect.objectContaining({
                    chartId: 'performance-overview-configurable-bar-graph',
                    dashboard,
                    chartName: chartConfig.label,
                }),
            )
        })

        it('does not render the action menu when chartConfig is missing', () => {
            render(
                <PerformanceOverviewConfigurableBarGraph
                    chartId="performance-overview-configurable-bar-graph"
                    dashboard={dashboard}
                />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
            expect(ChartsActionMenuMock).not.toHaveBeenCalled()
        })

        it('does not render the action menu when chartId is missing', () => {
            render(
                <PerformanceOverviewConfigurableBarGraph
                    chartConfig={chartConfig}
                />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
            expect(ChartsActionMenuMock).not.toHaveBeenCalled()
        })
    })
})
