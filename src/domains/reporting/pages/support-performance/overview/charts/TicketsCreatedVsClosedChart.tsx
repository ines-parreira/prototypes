import { useCreatedVsClosedTicketsTimeSeries } from 'domains/reporting/hooks/useCreatedVsClosedTicketsTimeSeries'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import BarChart from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { TICKETS_CREATED_VS_CLOSED_HINT } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { CREATED_VS_CLOSED_TICKETS_LABEL } from 'domains/reporting/services/constants'

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
