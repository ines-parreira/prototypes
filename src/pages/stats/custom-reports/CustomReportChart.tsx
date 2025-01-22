import React from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {getComponentConfig} from 'pages/stats/custom-reports/config'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import {DraggableGridCell} from 'pages/stats/custom-reports/DraggableGridCell'
import {
    ChartType,
    CustomReportChartSchema,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'

type Props = {
    order: number
    onMove: (srcIndex: number, targetIndex: number) => void
    schema: CustomReportChartSchema
    dashboard?: CustomReportSchema
}

export const CHART_SIZE: Record<ChartType, number> = {
    [ChartType.Card]: 3,
    [ChartType.Graph]: 6,
    [ChartType.Table]: 12,
}

export const CustomReportChart = ({
    order,
    onMove,
    schema,
    dashboard,
}: Props) => {
    const getGridCellSize = useGridSize()
    const {reportConfig, chartConfig} = getComponentConfig(schema.config_id)

    if (reportConfig === null || chartConfig === null) {
        return null
    }

    const size = getGridCellSize(CHART_SIZE[chartConfig.chartType])

    return (
        <DraggableGridCell size={size} order={order} onMove={onMove}>
            <CustomReportComponent
                chart={schema.config_id}
                config={reportConfig}
                dashboard={dashboard}
            />
        </DraggableGridCell>
    )
}
