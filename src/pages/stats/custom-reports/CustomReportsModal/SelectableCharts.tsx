import React, {useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import CheckBox from 'pages/common/forms/CheckBox'
import {MAX_CHECKED_CHARTS} from 'pages/stats/custom-reports/config'
import {
    ChartIcon,
    CHARTS_MODAL_ICONS,
} from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon'
import css from 'pages/stats/custom-reports/CustomReportsModal/SelectableCharts.less'
import {ChartConfig} from 'pages/stats/custom-reports/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const SelectableCharts = ({
    charts,
    checkedCharts,
    setCheckedCharts,
}: {
    charts: Record<string, ChartConfig>
    checkedCharts: string[]
    setCheckedCharts: (value: string[]) => void
}) => {
    const dispatch = useAppDispatch()

    const isChartChecked = useCallback(
        (chartId: string) =>
            !!checkedCharts.find(
                (checkedChartId) => checkedChartId === chartId
            ),
        [checkedCharts]
    )

    const selectReport = useCallback(
        (chartId: string) => {
            if (isChartChecked(chartId)) {
                setCheckedCharts(
                    checkedCharts.filter(
                        (checkedChart) => checkedChart !== chartId
                    )
                )
            } else {
                if (checkedCharts.length < MAX_CHECKED_CHARTS) {
                    setCheckedCharts([chartId, ...checkedCharts])
                } else {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: `You cannot select more than ${MAX_CHECKED_CHARTS} charts`,
                        })
                    )
                }
            }
        },
        [checkedCharts, dispatch, isChartChecked, setCheckedCharts]
    )

    return (
        <>
            {Object.entries(charts).map(([chartId, chart]) => (
                <CheckBox
                    key={chartId}
                    className={css.wrapper}
                    isChecked={isChartChecked(chartId)}
                    onClick={() => selectReport(chartId)}
                >
                    <ChartIcon
                        icon={CHARTS_MODAL_ICONS[chart.chartType]}
                        id={chartId}
                    />
                    <div>
                        <div className={css.title}>{chart.label}</div>
                        <div className={css.description}>
                            {chart.description}
                        </div>
                    </div>
                </CheckBox>
            ))}
        </>
    )
}
