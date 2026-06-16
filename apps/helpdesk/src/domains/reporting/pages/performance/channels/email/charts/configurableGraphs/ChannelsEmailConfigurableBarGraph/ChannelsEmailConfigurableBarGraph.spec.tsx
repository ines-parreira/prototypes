import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useStatsMetric } from 'domains/reporting/hooks/useStatsMetric'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { ChannelsEmailConfigurableBarGraph } from 'domains/reporting/pages/performance/channels/email/charts/configurableGraphs/ChannelsEmailConfigurableBarGraph/ChannelsEmailConfigurableBarGraph'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetric')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useStatsMetricMock = assumeMock(useStatsMetric)
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

describe('ChannelsEmailConfigurableBarGraph', () => {
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

        useStatsMetricMock
            .mockReturnValueOnce({
                data: { value: 120 },
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: { value: 30 },
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: { value: 90 },
                isFetching: false,
                isError: false,
            })

        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders a bar for each ticket status', () => {
        const { container } = render(
            <ChannelsEmailConfigurableBarGraph chartId="performance-channels-email-configurable-bar-graph" />,
        )

        expect(findSvgTextByContent(container, 'Created')).toBeTruthy()
        expect(findSvgTextByContent(container, 'Open')).toBeTruthy()
        expect(findSvgTextByContent(container, 'Closed')).toBeTruthy()
    })

    it('renders the responsive chart container', () => {
        const { container } = render(
            <ChannelsEmailConfigurableBarGraph chartId="performance-channels-email-configurable-bar-graph" />,
        )

        expect(
            container.querySelector('.recharts-responsive-container'),
        ).toBeInTheDocument()
    })

    describe('action menu', () => {
        it('renders the action menu when both chartId and chartConfig are provided', () => {
            render(
                <ChannelsEmailConfigurableBarGraph
                    chartId="performance-channels-email-configurable-bar-graph"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                />,
            )

            expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
            expect(ChartsActionMenuMock.mock.calls[0][0]).toEqual(
                expect.objectContaining({
                    chartId:
                        'performance-channels-email-configurable-bar-graph',
                    dashboard,
                    chartName: chartConfig.label,
                }),
            )
        })

        it('does not render the action menu when chartConfig is missing', () => {
            render(
                <ChannelsEmailConfigurableBarGraph
                    chartId="performance-channels-email-configurable-bar-graph"
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
                <ChannelsEmailConfigurableBarGraph chartConfig={chartConfig} />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
            expect(ChartsActionMenuMock).not.toHaveBeenCalled()
        })
    })
})
