import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useDecreaseInFirstResponseTimeTrend } from 'hooks/reporting/automate/useDecreaseInFirstResponseTimeTrend'
import { AutomationDecreaseInFirstResponseTimeMetric } from 'pages/automate/automate-metrics'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

export const AutomationDecreaseInFirstResponseTimeTrendChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const decreaseInFirstResponseTimeTrend =
        useDecreaseInFirstResponseTimeTrend(statsFilters, userTimezone)

    return (
        <AutomationDecreaseInFirstResponseTimeMetric
            trend={decreaseInFirstResponseTimeTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
