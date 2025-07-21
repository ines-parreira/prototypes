import { useIsChartRestricted } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import {
    DraggableGridCell,
    DropHandler,
    FindChartIndex,
    MoveHandler,
} from 'domains/reporting/pages/dashboards/DraggableGridCell'
import {
    ChartType,
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { useGridSize } from 'hooks/useGridSize'

export type DashboardChartProps = {
    findChartIndex: FindChartIndex
    onMove: MoveHandler
    onDrop: DropHandler
    schema: DashboardChartSchema
    dashboard?: DashboardSchema
}

export const CHART_SIZE: Record<ChartType, number> = {
    [ChartType.Card]: 3,
    [ChartType.Graph]: 6,
    [ChartType.Table]: 12,
}

export const DashboardChart = ({
    onMove,
    onDrop,
    findChartIndex,
    schema,
    dashboard,
}: DashboardChartProps) => {
    const getGridCellSize = useGridSize()
    const { reportConfig, chartConfig } = getComponentConfig(schema.config_id)
    const restricted = useIsChartRestricted(schema.config_id)
    if (reportConfig === null || chartConfig === null || restricted) {
        return null
    }

    const size = getGridCellSize(CHART_SIZE[chartConfig.chartType])

    return (
        <DraggableGridCell
            size={size}
            schema={schema}
            onMove={onMove}
            onDrop={onDrop}
            findChartIndex={findChartIndex}
        >
            <DashboardComponent
                chart={schema.config_id}
                config={reportConfig}
                dashboard={dashboard}
            />
        </DraggableGridCell>
    )
}
