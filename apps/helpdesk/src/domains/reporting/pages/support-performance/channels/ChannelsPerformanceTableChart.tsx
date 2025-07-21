import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { ChannelsCardExtra } from 'domains/reporting/pages/support-performance/channels/ChannelsCardExtra'
import { ChannelsTable } from 'domains/reporting/pages/support-performance/channels/ChannelsTable'

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
