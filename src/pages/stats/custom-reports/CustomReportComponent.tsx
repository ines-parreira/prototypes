import {useFlags} from 'launchdarkly-react-client-sdk'
import {createElement, memo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    CustomReportSchema,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import {useReportChartRestrictions} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
    dashboard?: CustomReportSchema
}

export const CustomReportComponent = memo(
    <T extends string>({chart, dashboard, config}: Props<T>) => {
        const isAnalyticsCustomReports: FeatureFlagKey =
            useFlags()[FeatureFlagKey.AnalyticsCustomReports]

        const {isChartRestrictedToCurrentUser} = useReportChartRestrictions()

        if (isChartRestrictedToCurrentUser(chart)) {
            return null
        }

        if (isAnalyticsCustomReports) {
            return createElement(config.charts[chart].chartComponent, {
                chartId: chart,
                dashboard,
            })
        }

        return createElement(config.charts[chart].chartComponent)
    }
)
