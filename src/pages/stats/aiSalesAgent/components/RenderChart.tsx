import { createElement, memo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    CustomReportSchema,
    ReportConfig,
} from 'pages/stats/custom-reports/types'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
    dashboard?: CustomReportSchema
}

export const RenderChart = memo(
    <T extends string>({ chart, dashboard, config }: Props<T>) => {
        const isAnalyticsCustomReports: FeatureFlagKey =
            useFlags()[FeatureFlagKey.AnalyticsCustomReports]

        if (isAnalyticsCustomReports) {
            return createElement(config.charts[chart].chartComponent, {
                chartId: chart,
                dashboard,
            })
        }
        return createElement(config.charts[chart].chartComponent)
    },
)
