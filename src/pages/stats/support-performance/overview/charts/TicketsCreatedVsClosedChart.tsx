import { useCreatedVsClosedTicketsTimeSeries } from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import ChartCard from 'pages/stats/common/components/ChartCard'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { TICKETS_CREATED_VS_CLOSED_HINT } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { CREATED_VS_CLOSED_TICKETS_LABEL } from 'services/reporting/constants'

export const TicketsCreatedVsClosedChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { timeSeries, isLoading } = useCreatedVsClosedTicketsTimeSeries()

    return (
        <ChartCard
            title={CREATED_VS_CLOSED_TICKETS_LABEL}
            hint={TICKETS_CREATED_VS_CLOSED_HINT}
            dashboard={dashboard}
            chartId={chartId}
        >
            <BarChart
                isLoading={isLoading}
                data={timeSeries}
                hasBackground
                _displayLegacyTooltip
                displayLegend
                legendOnLeft
            />
        </ChartCard>
    )
}
