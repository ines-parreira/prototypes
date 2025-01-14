import _flatten from 'lodash/flatten'
import React from 'react'

import {REPORTS_MODAL_CONFIG} from 'pages/stats/custom-reports/config'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import {
    ReportConfig,
    CustomReportChartSchema,
} from 'pages/stats/custom-reports/types'

type Props = {
    schema: CustomReportChartSchema
}

export const getComponentConfig = (
    configId: string
): {config: ReportConfig<string> | null; chart: string | null} => {
    const availableCharts = _flatten(
        REPORTS_MODAL_CONFIG.map((report) => report.children)
    )
    for (const chart of availableCharts) {
        if (Object.values(chart.type).includes(configId)) {
            return {
                config: chart.config,
                chart: configId,
            }
        }
    }

    return {chart: null, config: null}
}

export const CustomReportChart = ({schema}: Props) => {
    const {chart, config} = getComponentConfig(schema.config_id)

    if (chart === null || config === null || config === undefined) {
        return null
    }

    return (
        <CustomReportComponent
            chart={chart}
            config={config}
            activateActionsMenu={false}
        />
    )
}
