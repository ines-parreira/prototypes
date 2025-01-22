import React from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {getComponentConfig} from 'pages/stats/custom-reports/config'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import {
    ChartType,
    CustomReportChartSchema,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

type Props = {
    schema: CustomReportChartSchema
    dashboard?: CustomReportSchema
}

export const CHART_SIZE: Record<ChartType, number> = {
    [ChartType.Card]: 3,
    [ChartType.Graph]: 6,
    [ChartType.Table]: 12,
}

export const CustomReportChart = ({schema, dashboard}: Props) => {
    const getGridCellSize = useGridSize()
    const {reportConfig, chartConfig} = getComponentConfig(schema.config_id)

    if (reportConfig === null || chartConfig === null) {
        return null
    }

    return (
        <DashboardGridCell
            size={getGridCellSize(CHART_SIZE[chartConfig.chartType])}
            className="pb-0"
        >
            <CustomReportComponent
                chart={schema.config_id}
                config={reportConfig}
                dashboard={dashboard}
            />
        </DashboardGridCell>
    )
}
