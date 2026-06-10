import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { ChannelsVoiceConfigurableGraph } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/ChannelsVoiceConfigurableGraph'
import { useChannelsVoiceCallOutcomeSankeyData } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/useChannelsVoiceCallOutcomeSankeyData'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/useChannelsVoiceCallOutcomeSankeyData',
)
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

const useStatsFiltersMock = assumeMock(useStatsFilters)
const useChannelsVoiceCallOutcomeSankeyDataMock = assumeMock(
    useChannelsVoiceCallOutcomeSankeyData,
)
const ChartsActionMenuMock = assumeMock(ChartsActionMenu)

const cleanStatsFilters = {
    period: { start_datetime: '2024-01-01', end_datetime: '2024-01-31' },
}
const userTimezone = 'UTC'

const chartConfig: ChartConfig = {
    chartComponent: () => <div />,
    label: 'Call outcome',
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

describe('ChannelsVoiceConfigurableGraph', () => {
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
            cleanStatsFilters,
            userTimezone,
            granularity: 'day',
        } as any)

        useChannelsVoiceCallOutcomeSankeyDataMock.mockReturnValue({
            data: {
                nodes: [
                    { name: 'Total calls', color: '#7E55F6' },
                    { name: 'Inbound', color: '#9B7BFF' },
                ],
                links: [
                    { source: 'Total calls', target: 'Inbound', value: 10 },
                ],
            },
            isLoading: false,
        })

        ChartsActionMenuMock.mockReturnValue(<div>ChartsActionMenu</div>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the chart title', () => {
        render(
            <ChannelsVoiceConfigurableGraph chartId="performance-channels-voice-configurable-graph" />,
        )

        expect(screen.getAllByText('Call outcome').length).toBeGreaterThan(0)
    })

    it('renders the chart instead of the empty state when call-outcome data is available', () => {
        render(
            <ChannelsVoiceConfigurableGraph chartId="performance-channels-voice-configurable-graph" />,
        )

        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })

    it('feeds the current stats filters and timezone to the data hook', () => {
        render(
            <ChannelsVoiceConfigurableGraph chartId="performance-channels-voice-configurable-graph" />,
        )

        expect(useChannelsVoiceCallOutcomeSankeyDataMock).toHaveBeenCalledWith(
            cleanStatsFilters,
            userTimezone,
        )
    })

    describe('action menu', () => {
        it('renders the action menu when both chartId and chartConfig are provided', () => {
            render(
                <ChannelsVoiceConfigurableGraph
                    chartId="performance-channels-voice-configurable-graph"
                    dashboard={dashboard}
                    chartConfig={chartConfig}
                />,
            )

            expect(screen.getByText('ChartsActionMenu')).toBeInTheDocument()
            expect(ChartsActionMenuMock.mock.calls[0][0]).toEqual(
                expect.objectContaining({
                    chartId: 'performance-channels-voice-configurable-graph',
                    dashboard,
                    chartName: chartConfig.label,
                }),
            )
        })

        it('does not render the action menu when chartConfig is missing', () => {
            render(
                <ChannelsVoiceConfigurableGraph
                    chartId="performance-channels-voice-configurable-graph"
                    dashboard={dashboard}
                />,
            )

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
            expect(ChartsActionMenuMock).not.toHaveBeenCalled()
        })

        it('does not render the action menu when chartId is missing', () => {
            render(<ChannelsVoiceConfigurableGraph chartConfig={chartConfig} />)

            expect(
                screen.queryByText('ChartsActionMenu'),
            ).not.toBeInTheDocument()
            expect(ChartsActionMenuMock).not.toHaveBeenCalled()
        })
    })
})
