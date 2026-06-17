import { createElement, memo, useMemo } from 'react'

import { DashboardChartProvider } from 'domains/reporting/pages/dashboards/DashboardChartContext'
import type {
    DashboardChartSchema,
    DashboardSchema,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
    dashboard?: DashboardSchema
    withChartMenu?: boolean
    customDashboardChartSchema?: DashboardChartSchema
}

export const DashboardComponent = memo(
    <T extends string>({
        chart,
        dashboard,
        config,
        withChartMenu = true,
        customDashboardChartSchema,
    }: Props<T>) => {
        const { isChartRestrictedToCurrentUser } = useReportChartRestrictions()
        const chartConfig = config.charts[chart]
        const contextValue = useMemo(
            () => ({
                dashboard: withChartMenu ? dashboard : undefined,
                schema: customDashboardChartSchema,
                chartId: chart,
                chartConfig,
            }),
            [
                withChartMenu,
                dashboard,
                customDashboardChartSchema,
                chart,
                chartConfig,
            ],
        )

        if (isChartRestrictedToCurrentUser(chart)) {
            return null
        }

        const props = {
            chartConfig,
            chartId: chart,
            withChartMenu,
            customDashboardChartSchema,
            ...(withChartMenu ? { dashboard } : {}),
        }
        return createElement(
            DashboardChartProvider,
            { value: contextValue },
            createElement(chartConfig.chartComponent, props),
        )
    },
)
