import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { DecreaseInResolutionTimeMetric } from 'pages/automate/automate-metrics'

export const DecreaseInResolutionTimeKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const decreaseInResolutionTimeTrend = useDecreaseInResolutionTimeTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <DecreaseInResolutionTimeMetric
            trend={decreaseInResolutionTimeTrend}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
