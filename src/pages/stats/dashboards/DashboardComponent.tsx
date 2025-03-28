import { createElement, memo } from 'react'

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
        const { isChartRestrictedToCurrentUser } = useReportChartRestrictions()

        if (isChartRestrictedToCurrentUser(chart)) {
            return null
        }

        const props = withChartMenu
            ? {
                  chartId: chart,
                  dashboard,
              }
            : {}
        return createElement(config.charts[chart].chartComponent, props)
    },
)
