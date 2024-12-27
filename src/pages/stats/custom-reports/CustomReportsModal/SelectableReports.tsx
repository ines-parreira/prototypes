import classnames from 'classnames'
import React from 'react'

import IconInput from 'pages/common/forms/input/IconInput'
import {ReportConfig} from 'pages/stats/common/CustomReport/types'
import {ReportsModalConfig} from 'pages/stats/custom-reports/CustomReportsModal/CustomReportsModal'
import css from 'pages/stats/custom-reports/CustomReportsModal/SelectableReports.less'
import {getNumberOfSelections} from 'pages/stats/custom-reports/utils'

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
                            selectedReport?.reportPath === chart.reportPath
                        const numberOfSelections = getNumberOfSelections(
                            chart.charts,
                            checkedCharts
                        )

                        return (
                            <div
                                key={chart.reportPath}
                                className={classnames(css.subcategory, {
                                    [css.isSelected]: isReportSelected,
                                })}
                                onClick={() => setSelectedReport(chart)}
                            >
                                <div>
                                    {chart.reportName}
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
