import {useFlags} from 'launchdarkly-react-client-sdk'
import {createElement, memo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {ReportConfig} from 'pages/stats/custom-reports/types'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
    activateActionsMenu: boolean
}

export const CustomReportComponent = memo(
    <T extends string>({chart, config, activateActionsMenu}: Props<T>) => {
        const isAnalyticsCustomReports: FeatureFlagKey =
            useFlags()[FeatureFlagKey.AnalyticsCustomReports]

        if (isAnalyticsCustomReports && activateActionsMenu) {
            return createElement(config.charts[chart].chartComponent, {
                chartId: chart,
            })
        }

        return createElement(config.charts[chart].chartComponent)
    }
)
