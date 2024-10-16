import React from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {TableHeatmapSwitch} from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import {TableValueModeSwitch} from 'pages/stats/common/components/Table/TableValueModeSwitch'
import css from 'pages/stats/BreakdownTable.less'
import ChartCard from 'pages/stats/ChartCard'
import {AllUsedTagsTable} from 'pages/stats/ticket-insights/tags/AllUsedTagsTable'
import {
    getHeatmapMode,
    getValueMode,
    toggleHeatmapMode,
    toggleValueMode,
} from 'state/ui/stats/tagsReportSlice'

const REPORT_TITLE = 'All used tags'
const REPORT_HINT =
    'Number of tickets labeled with each tag within the selected timeframe. Only tags that have been used at least once are shown.'

export const AllUsedTagsTableChart = () => {
    const dispatch = useAppDispatch()
    const valueMode = useAppSelector(getValueMode)
    const heatmapMode = useAppSelector(getHeatmapMode)
    const valueModeHandler = () => dispatch(toggleValueMode())

    const heatmapModeHandler = () => dispatch(toggleHeatmapMode())

    return (
        <ChartCard
            title={REPORT_TITLE}
            hint={{title: REPORT_HINT}}
            noPadding={true}
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
