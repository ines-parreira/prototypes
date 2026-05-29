import { useMigratedChartId } from 'domains/reporting/hooks/dashboards/useMigratedChartId'
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
    const effectiveChartId = useMigratedChartId(schema.config_id)
    const { reportConfig, chartConfig } = getComponentConfig(
        effectiveChartId ?? '',
    )
    const restricted = useIsChartRestricted(effectiveChartId ?? '')

    if (
        effectiveChartId === null ||
        reportConfig === null ||
        chartConfig === null ||
        restricted
    ) {
        return null
    }

    return (
        <DashboardComponent
            chart={effectiveChartId}
            config={reportConfig}
            dashboard={dashboard}
        />
    )
}
