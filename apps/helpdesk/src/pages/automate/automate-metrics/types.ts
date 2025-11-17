import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export interface BaseAutomateMetricProps extends DashboardChartProps {
    trend: MetricTrend
}

export interface AutomateMetricProps extends BaseAutomateMetricProps {
    showTips?: boolean
    title?: string
}
