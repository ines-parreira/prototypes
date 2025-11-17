import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import css from 'domains/reporting/pages/common/components/Table/BreakdownTable.less'
import { TableHeatmapSwitch } from 'domains/reporting/pages/common/components/Table/TableHeatmapSwitch'
import { TableValueModeSwitch } from 'domains/reporting/pages/common/components/Table/TableValueModeSwitch'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AllUsedTagsTable } from 'domains/reporting/pages/ticket-insights/tags/AllUsedTagsTable'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'domains/reporting/pages/ticket-insights/tags/TagsMetricConfig'
import {
    getHeatmapMode,
    getValueMode,
    toggleHeatmapMode,
    toggleValueMode,
} from 'domains/reporting/state/ui/stats/tagsReportSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

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
