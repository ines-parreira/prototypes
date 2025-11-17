import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomationDecreaseInFirstResponseTimeMetric } from 'pages/automate/automate-metrics'

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
