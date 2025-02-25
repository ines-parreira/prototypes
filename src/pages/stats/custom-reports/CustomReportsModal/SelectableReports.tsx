import React from 'react'

import classnames from 'classnames'

import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/custom-reports/CustomReportsModal/SelectableReports.less'
import {
    ReportConfig,
    ReportsModalConfig,
} from 'pages/stats/custom-reports/types'
import { getNumberOfSelections } from 'pages/stats/custom-reports/utils'

export const SelectableReports = ({
    config,
    checkedCharts,
    selectedReport,
    setSelectedReport,
}: {
    config: ReportsModalConfig | null
    checkedCharts: string[]
    selectedReport: null | ReportConfig<string>
    setSelectedReport: (value: ReportConfig<string>) => void
}) => {
    if (config === null) {
        return null
    }

    return (
        <>
            {config.map((report, index) => (
                <div key={report.category}>
                    <div className={css.category}>{report.category}</div>
                    {Object.values(report.children).map((chart) => {
                        const isReportSelected =
                            selectedReport?.reportPath ===
                            chart.config.reportPath
                        const numberOfSelections = getNumberOfSelections(
                            chart.config.charts,
                            checkedCharts,
                        )

                        return (
                            <div
                                key={chart.config.reportPath}
                                className={classnames(css.subcategory, {
                                    [css.isSelected]: isReportSelected,
                                })}
                                onClick={() => setSelectedReport(chart.config)}
                            >
                                <div>
                                    {chart.config.reportName}
                                    {numberOfSelections > 0 && (
                                        <div
                                            className={css.selection}
                                        >{`${numberOfSelections} Selections`}</div>
                                    )}
                                </div>

                                {isReportSelected && (
                                    <IconInput
                                        icon="chevron_right"
                                        className={css.icon}
                                    />
                                )}
                            </div>
                        )
                    })}
                    {config.length - 1 !== index && (
                        <div className={css.separator} />
                    )}
                </div>
            ))}
        </>
    )
}
