import {MetricTrend} from 'hooks/reporting/useMetricTrend'

export interface BaseAutomationMetricProps {
    trend: MetricTrend
}

export interface AutomationMetricProps extends BaseAutomationMetricProps {
    showTips?: boolean
}
