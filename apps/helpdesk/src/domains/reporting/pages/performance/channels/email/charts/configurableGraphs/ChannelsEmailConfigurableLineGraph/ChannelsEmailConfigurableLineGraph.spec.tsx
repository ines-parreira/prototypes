import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    useStatsMetricTimeSeries,
    useStatsMetricTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { ChannelsEmailConfigurableLineGraph } from 'domains/reporting/pages/performance/channels/email/charts/configurableGraphs/ChannelsEmailConfigurableLineGraph/ChannelsEmailConfigurableLineGraph'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricTimeSeries')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useStatsMetricTimeSeriesMock = assumeMock(useStatsMetricTimeSeries)
const useStatsMetricTimeSeriesPerDimensionMock = assumeMock(
    useStatsMetricTimeSeriesPerDimension,
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

const chartConfig: ChartConfig = {
    chartComponent: () => <div />,
    label: 'Configurable line graph',
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

describe('ChannelsEmailConfigurableLineGraph', () => {
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
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        } as any)

        useStatsMetricTimeSeriesMock.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 4.5 }]],
            isFetching: false,
        } as any)

        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: { email: [[{ dateTime: '2024-01-01', value: 4.5 }]] },
            isFetching: false,
        } as any)

        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the first metric title', () => {
        render(
            <ChannelsEmailConfigurableLineGraph chartId="performance-channels-email-configurable-line-graph" />,
        )

        expect(
            screen.getAllByText('Email tickets created').length,
        ).toBeGreaterThan(0)
    })

    it('renders the metric selector with all four measures available', () => {
        render(
            <ChannelsEmailConfigurableLineGraph chartId="performance-channels-email-configurable-line-graph" />,
        )

        expect(
            screen.getByRole('button', { name: /Email tickets created/i }),
        ).toBeInTheDocument()
        expect(screen.getAllByText('Resolution time').length).toBeGreaterThan(0)
        expect(
            screen.getAllByText('First response time').length,
        ).toBeGreaterThan(0)
        expect(
            screen.getAllByText('Messages per ticket').length,
        ).toBeGreaterThan(0)
    })

    it('renders the dimension selector with overall and sub-channel options', () => {
        render(
            <ChannelsEmailConfigurableLineGraph chartId="performance-channels-email-configurable-line-graph" />,
        )

        expect(screen.getAllByText('Overall').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Sub-channel').length).toBeGreaterThan(0)
    })

    it('renders the responsive chart container', () => {
        const { container } = render(
            <ChannelsEmailConfigurableLineGraph chartId="performance-channels-email-configurable-line-graph" />,
        )

        expect(
            container.querySelector('.recharts-responsive-container'),
        ).toBeInTheDocument()
    })

    describe('action menu', () => {
        it('renders the action menu when both chartId and chartConfig are provided', () => {
            render(
                <ChannelsEmailConfigurableLineGraph
                    chartId="performance-channels-email-configurable-line-graph"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                />,
            )

            expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
            expect(ChartsActionMenuMock.mock.calls[0][0]).toEqual(
                expect.objectContaining({
                    chartId:
                        'performance-channels-email-configurable-line-graph',
                    dashboard,
                    chartName: chartConfig.label,
                }),
            )
        })

        it('does not render the action menu when chartConfig is missing', () => {
            render(
                <ChannelsEmailConfigurableLineGraph
                    chartId="performance-channels-email-configurable-line-graph"
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
                <ChannelsEmailConfigurableLineGraph
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
