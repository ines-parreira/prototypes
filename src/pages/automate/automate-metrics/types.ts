import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'

export interface BaseAutomateMetricProps extends DashboardChartProps {
    trend: MetricTrend
}

export interface AutomateMetricProps extends BaseAutomateMetricProps {
    showTips?: boolean
}
