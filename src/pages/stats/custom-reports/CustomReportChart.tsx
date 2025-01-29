import React from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {getComponentConfig} from 'pages/stats/custom-reports/config'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import {
    DraggableGridCell,
    MoveHandler,
    DropHandler,
} from 'pages/stats/custom-reports/DraggableGridCell'
import {
    ChartType,
    CustomReportChartSchema,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'

export type CustomReportChartProps = {
    onMove: MoveHandler
    onDrop: DropHandler
    schema: CustomReportChartSchema
    dashboard?: CustomReportSchema
}

export const CHART_SIZE: Record<ChartType, number> = {
    [ChartType.Card]: 3,
    [ChartType.Graph]: 6,
    [ChartType.Table]: 12,
}

export const CustomReportChart = ({
    onMove,
    onDrop,
    schema,
    dashboard,
}: CustomReportChartProps) => {
    const getGridCellSize = useGridSize()
    const {reportConfig, chartConfig} = getComponentConfig(schema.config_id)

    if (reportConfig === null || chartConfig === null) {
        return null
    }

    const size = getGridCellSize(CHART_SIZE[chartConfig.chartType])

    return (
        <DraggableGridCell
            size={size}
            schema={schema}
            onMove={onMove}
            onDrop={onDrop}
        >
            <CustomReportComponent
                chart={schema.config_id}
                config={reportConfig}
                dashboard={dashboard}
            />
        </DraggableGridCell>
    )
}
