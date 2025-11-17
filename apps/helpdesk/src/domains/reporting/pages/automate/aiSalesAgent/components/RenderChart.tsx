import { createElement, memo } from 'react'

import type {
    DashboardSchema,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'

type Props<T extends string> = {
    chart: T
    config: ReportConfig<T>
    dashboard?: DashboardSchema
}

export const RenderChart = memo(
    <T extends string>({ chart, dashboard, config }: Props<T>) => {
        return createElement(config.charts[chart].chartComponent, {
            chartId: chart,
            dashboard,
        })
    },
)
