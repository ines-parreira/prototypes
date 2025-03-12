import { createElement, memo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { DashboardSchema, ReportConfig } from 'pages/stats/dashboards/types'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
    dashboard?: DashboardSchema
    withChartMenu?: boolean
}

export const DashboardComponent = memo(
    <T extends string>({
        chart,
        dashboard,
        config,
        withChartMenu = true,
    }: Props<T>) => {
        const isAnalyticsCustomReports: FeatureFlagKey =
            useFlags()[FeatureFlagKey.AnalyticsCustomReports]

        const { isChartRestrictedToCurrentUser } = useReportChartRestrictions()

        if (isChartRestrictedToCurrentUser(chart)) {
            return null
        }

        if (isAnalyticsCustomReports) {
            const props = withChartMenu
                ? {
                      chartId: chart,
                      dashboard,
                  }
                : {}
            return createElement(config.charts[chart].chartComponent, props)
        }

        return createElement(config.charts[chart].chartComponent)
    },
)
