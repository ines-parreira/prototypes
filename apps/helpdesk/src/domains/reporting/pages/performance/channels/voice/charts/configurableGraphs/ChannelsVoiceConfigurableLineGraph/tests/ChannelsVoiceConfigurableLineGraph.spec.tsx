import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSaveCustomDashboardPreference } from 'domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    useStatsMetricTimeSeries,
    useStatsMetricTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import { ChannelsVoiceConfigurableLineGraph } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableLineGraph/ChannelsVoiceConfigurableLineGraph'

jest.mock('domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricTimeSeries')
jest.mock('@repo/reporting', () => {
    const actual = jest.requireActual('@repo/reporting')
    return {
        ...actual,
        ConfigurableGraph: jest.fn(actual.ConfigurableGraph),
        useDashboardContext: jest.fn().mockReturnValue(null),
    }
})
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const ConfigurableGraphMock = jest.requireMock('@repo/reporting')
    .ConfigurableGraph as jest.Mock
const useSaveCustomDashboardPreferenceMock = assumeMock(
    useSaveCustomDashboardPreference,
)
const useStatsFiltersMock = assumeMock(useStatsFilters)
const useStatsMetricTimeSeriesMock = assumeMock(useStatsMetricTimeSeries)
const useStatsMetricTimeSeriesPerDimensionMock = assumeMock(
    useStatsMetricTimeSeriesPerDimension,
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

const cleanStatsFilters = {
    period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
}
const userTimezone = 'UTC'

const chartConfig: ChartConfig = {
    chartComponent: () => <div />,
    label: 'Voice metrics over time',
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

const schema: DashboardChartSchema = {
    type: DashboardChildType.Chart,
    config_id: 'performance-channels-voice-configurable-line-graph',
}

describe('ChannelsVoiceConfigurableLineGraph', () => {
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
        useSaveCustomDashboardPreferenceMock.mockReturnValue({
            savePreferences: jest.fn(),
        })

        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters,
            userTimezone,
            granularity: 'day',
        } as any)

        useStatsMetricTimeSeriesMock.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 10 }]],
            isFetching: false,
        } as any)
        useStatsMetricTimeSeriesPerDimensionMock.mockReturnValue({
            data: {},
            isFetching: false,
        } as any)

        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the selected measure title', () => {
        render(
            <ChannelsVoiceConfigurableLineGraph chartId="performance-channels-voice-configurable-line-graph" />,
        )

        expect(screen.getAllByText('Total calls').length).toBeGreaterThan(0)
    })

    it('renders the chart instead of the empty state when timeseries data is available', () => {
        render(
            <ChannelsVoiceConfigurableLineGraph chartId="performance-channels-voice-configurable-line-graph" />,
        )

        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })

    describe('action menu', () => {
        it('renders the action menu when both chartId and chartConfig are provided', () => {
            render(
                <ChannelsVoiceConfigurableLineGraph
                    chartId="performance-channels-voice-configurable-line-graph"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                />,
            )

            expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
            expect(ChartsActionMenuMock.mock.calls[0][0]).toEqual(
                expect.objectContaining({
                    chartId:
                        'performance-channels-voice-configurable-line-graph',
                    dashboard,
                    chartName: chartConfig.label,
                }),
            )
        })

        it('does not render the action menu when chartConfig is missing', () => {
            render(
                <ChannelsVoiceConfigurableLineGraph
                    chartId="performance-channels-voice-configurable-line-graph"
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
                <ChannelsVoiceConfigurableLineGraph
                    chartConfig={chartConfig}
                />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
            expect(ChartsActionMenuMock).not.toHaveBeenCalled()
        })
    })

    describe('save preferences', () => {
        it('passes savePreferences as onSelect to ConfigurableGraph', () => {
            const savePreferences = jest.fn()
            useSaveCustomDashboardPreferenceMock.mockReturnValue({
                savePreferences,
            })

            render(
                <ChannelsVoiceConfigurableLineGraph chartId="performance-channels-voice-configurable-line-graph" />,
            )

            expect(ConfigurableGraphMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    onSelect: savePreferences,
                }),
                {},
            )
        })

        it('passes customDashboardChartSchema to ConfigurableGraph when provided', () => {
            render(
                <ChannelsVoiceConfigurableLineGraph
                    chartId="performance-channels-voice-configurable-line-graph"
                    customDashboardChartSchema={schema}
                />,
            )

            expect(ConfigurableGraphMock).toHaveBeenCalledWith(
                expect.objectContaining({ customDashboardChartSchema: schema }),
                {},
            )
        })
    })
})
