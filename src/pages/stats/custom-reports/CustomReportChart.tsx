import React from 'react'

import {CustomReportComponent} from 'pages/stats/common/CustomReport/CustomReportComponent'
import {CustomReportChartSchema} from 'pages/stats/custom-reports/types'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'

type Props = {
    schema: CustomReportChartSchema
}

const getChartId = (configId: string): OverviewChart | undefined => {
    return Object.values(OverviewChart).find((x) => String(x) === configId)
}

const getComponentConfig = (configId: string) => {
    const chartId = getChartId(configId)

    if (!chartId) {
        return {chart: null, config: null}
    }

    return {
        chart: chartId,
        config: SupportPerformanceOverviewReportConfig,
    }
}

export const CustomReportChart = ({schema}: Props) => {
    const {chart, config} = getComponentConfig(schema.config_id)

    if (chart === null || config === null) {
        return null
    }

    return <CustomReportComponent chart={chart} config={config} />
}
