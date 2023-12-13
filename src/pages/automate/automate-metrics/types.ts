import {MetricTrend} from 'hooks/reporting/useMetricTrend'

export interface BaseAutomateMetricProps {
    trend: MetricTrend
}

export interface AutomateMetricProps extends BaseAutomateMetricProps {
    showTips?: boolean
}
