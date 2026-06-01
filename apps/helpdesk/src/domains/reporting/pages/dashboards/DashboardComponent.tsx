import { createElement, memo } from 'react'

import type {
    DashboardSchema,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
    dashboard?: DashboardSchema
    withChartMenu?: boolean
    isCustomDashboard?: boolean
}

export const DashboardComponent = memo(
    <T extends string>({
        chart,
        dashboard,
        config,
        withChartMenu = true,
        isCustomDashboard,
    }: Props<T>) => {
        const { isChartRestrictedToCurrentUser } = useReportChartRestrictions()

        if (isChartRestrictedToCurrentUser(chart)) {
            return null
        }

        const props = {
            chartConfig: config.charts[chart],
            chartId: chart,
            withChartMenu,
            isCustomDashboard,
            ...(withChartMenu ? { dashboard } : {}),
        }
        return createElement(config.charts[chart].chartComponent, props)
    },
)
