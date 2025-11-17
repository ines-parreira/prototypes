import { useIsChartRestricted } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'

type DashboardChartProps = {
    schema: DashboardChartSchema
    dashboard?: DashboardSchema
}

export const DragAndResizeChart = ({
    schema,
    dashboard,
}: DashboardChartProps) => {
    const { reportConfig, chartConfig } = getComponentConfig(schema.config_id)
    const restricted = useIsChartRestricted(schema.config_id)
    if (reportConfig === null || chartConfig === null || restricted) {
        return null
    }

    return (
        <DashboardComponent
            chart={schema.config_id}
            config={reportConfig}
            dashboard={dashboard}
        />
    )
}
