import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import { ActivateCustomerSatisfactionSurveyTip } from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { SupportPerformanceTip } from 'pages/stats/SupportPerformanceTip'
import { MetricName } from 'services/reporting/constants'
import {
    currentAccountHasFeature,
    getSurveysSettingsJS,
} from 'state/currentAccount/selectors'
import { AccountFeature } from 'state/currentAccount/types'

export const CustomerSatisfactionTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(STATS_TIPS_VISIBILITY_KEY, true)

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
