import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/stats/BreakdownTable.less'
import ChartCard from 'pages/stats/ChartCard'
import { TableHeatmapSwitch } from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import { TableValueModeSwitch } from 'pages/stats/common/components/Table/TableValueModeSwitch'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { AllUsedTagsTable } from 'pages/stats/ticket-insights/tags/AllUsedTagsTable'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'pages/stats/ticket-insights/tags/TagsMetricConfig'
import {
    getHeatmapMode,
    getValueMode,
    toggleHeatmapMode,
    toggleValueMode,
} from 'state/ui/stats/tagsReportSlice'

export const AllUsedTagsTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const dispatch = useAppDispatch()
    const valueMode = useAppSelector(getValueMode)
    const heatmapMode = useAppSelector(getHeatmapMode)
    const valueModeHandler = () => dispatch(toggleValueMode())

    const heatmapModeHandler = () => dispatch(toggleHeatmapMode())

    const { hint, title } =
        TicketInsightsTagsMetricConfig[
            TicketInsightsTagsMetric.AllUsedTagsTableChart
        ]

    return (
        <ChartCard
            title={title}
            hint={hint}
            noPadding={true}
            chartId={chartId}
            dashboard={dashboard}
            className={css.tagsTableWrapperHeight}
            titleExtra={
                <div className={css.switches}>
                    <TableValueModeSwitch
                        valueMode={valueMode}
                        toggleValueMode={valueModeHandler}
                    />
                    <TableHeatmapSwitch
                        isHeatmapMode={heatmapMode}
                        toggleHandler={heatmapModeHandler}
                    />
                </div>
            }
        >
            <AllUsedTagsTable heatmapMode={heatmapMode} valueMode={valueMode} />
        </ChartCard>
    )
}
