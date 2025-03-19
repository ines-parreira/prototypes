import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { ChannelsCardExtra } from 'pages/stats/support-performance/channels/ChannelsCardExtra'
import { ChannelsTable } from 'pages/stats/support-performance/channels/ChannelsTable'

export const CHANNEL_PERFORMANCE_TABLE_TITLE = 'Channel performance'

export const ChannelsPerformanceTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <ChartCard
            title={CHANNEL_PERFORMANCE_TABLE_TITLE}
            noPadding
            titleExtra={<ChannelsCardExtra />}
            dashboard={dashboard}
            chartId={chartId}
        >
            <ChannelsTable />
        </ChartCard>
    )
}
