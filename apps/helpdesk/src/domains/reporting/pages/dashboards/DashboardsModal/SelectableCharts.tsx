import React, { useCallback } from 'react'

import { toast } from '@gorgias/axiom'

import { MAX_CHECKED_CHARTS } from 'domains/reporting/pages/dashboards/config'
import {
    ChartIcon,
    CHARTS_MODAL_ICONS,
} from 'domains/reporting/pages/dashboards/DashboardsModal/ChartIcon'
import css from 'domains/reporting/pages/dashboards/DashboardsModal/SelectableCharts.less'
import type { ChartConfig } from 'domains/reporting/pages/dashboards/types'
import CheckBox from 'pages/common/forms/CheckBox'

export const SelectableCharts = ({
    charts,
    checkedCharts,
    setCheckedCharts,
}: {
    charts: Record<string, ChartConfig>
    checkedCharts: string[]
    setCheckedCharts: (value: string[]) => void
}) => {
    const isChartChecked = useCallback(
        (chartId: string) =>
            !!checkedCharts.find(
                (checkedChartId) => checkedChartId === chartId,
            ),
        [checkedCharts],
    )

    const selectReport = useCallback(
        (chartId: string) => {
            if (isChartChecked(chartId)) {
                setCheckedCharts(
                    checkedCharts.filter(
                        (checkedChart) => checkedChart !== chartId,
                    ),
                )
            } else {
                if (checkedCharts.length < MAX_CHECKED_CHARTS) {
                    setCheckedCharts([chartId, ...checkedCharts])
                } else {
                    toast.error(
                        `You cannot select more than ${MAX_CHECKED_CHARTS} charts`,
                    )
                }
            }
        },
        [checkedCharts, isChartChecked, setCheckedCharts],
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
                            {chart.description ?? chart.tooltipConfig?.caption}
                        </div>
                    </div>
                </CheckBox>
            ))}
        </>
    )
}
