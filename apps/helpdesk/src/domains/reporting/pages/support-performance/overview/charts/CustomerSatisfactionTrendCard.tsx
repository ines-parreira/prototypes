import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { ActivateCustomerSatisfactionSurveyTip } from 'domains/reporting/pages/support-performance/components/ActivateCustomerSatisfactionSurveyTip'
import { SupportPerformanceTip } from 'domains/reporting/pages/support-performance/components/SupportPerformanceTip'
import { useTipsVisibility } from 'domains/reporting/pages/support-performance/overview/hooks/useTipsVisibility'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { MetricName } from 'domains/reporting/services/constants'
import useAppSelector from 'hooks/useAppSelector'
import {
    currentAccountHasFeature,
    getSurveysSettingsJS,
} from 'state/currentAccount/selectors'
import { AccountFeature } from 'state/currentAccount/types'

export const CustomerSatisfactionTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useTipsVisibility()

    const surveySettings = useAppSelector(getSurveysSettingsJS)
    const hasSatisfactionSurveyEnabled = useAppSelector<boolean>(
        currentAccountHasFeature(AccountFeature.SatisfactionSurveys),
    )
    const hasSatisfactionSurveyEnabledAndConfigured =
        hasSatisfactionSurveyEnabled &&
        (surveySettings?.data.send_survey_for_chat ||
            surveySettings?.data.send_survey_for_email)

    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.CustomerSatisfaction]}
            drillDownMetric={OverviewMetric.CustomerSatisfaction}
            dashboard={dashboard}
            chartId={chartId}
            tip={
                areTipsVisible &&
                (hasSatisfactionSurveyEnabledAndConfigured ? (
                    <SupportPerformanceTip
                        metric={MetricName.CustomerSatisfaction}
                        {...OverviewMetricConfig[
                            OverviewMetric.CustomerSatisfaction
                        ]}
                    />
                ) : (
                    <ActivateCustomerSatisfactionSurveyTip />
                ))
            }
        />
    )
}
