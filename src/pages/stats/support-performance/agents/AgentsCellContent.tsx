import classNames from 'classnames'
import React, {PropsWithRef} from 'react'
import {User} from 'config/types/user'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {
    METRIC_COLUMN_WIDTH,
    MetricQueryPerAgentQuery,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    formatMetricValue,
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import css from 'pages/stats/heatmap.less'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'

export type AgentsCellContentProps = {
    agent: User
    bodyCellProps?: PropsWithRef<BodyCellProps>
    useMetricPerAgentQueryHook: MetricQueryPerAgentQuery
    metricFormat: MetricValueFormat
    drillDownMetricData: DrillDownMetric | null
    isHeatmapMode: boolean
    isSortingMetricLoading: boolean
}

export const AgentsCellContent = ({
    agent,
    bodyCellProps,
    useMetricPerAgentQueryHook,
    metricFormat,
    drillDownMetricData,
    isHeatmapMode,
    isSortingMetricLoading,
}: AgentsCellContentProps) => {
    const {isAnalyticsNewFilters, cleanStatsFilters, userTimezone} =
        useNewStatsFilters()
    const {data, isFetching} = useMetricPerAgentQueryHook(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agent.id)
    )
    const metricValue = data?.value
    const isLoading = isFetching || isSortingMetricLoading
    const formattedMetric = formatMetricValue(
        metricValue,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER
    )

    return (
        <BodyCell
            {...bodyCellProps}
            className={classNames(
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`]
            )}
            innerClassName={classNames(
                bodyCellProps?.innerClassName,
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`]
            )}
        >
            {isLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : drillDownMetricData !== null ? (
                <DrillDownModalTrigger
                    enabled={!!metricValue}
                    metricData={drillDownMetricData}
                    useNewFilterData={isAnalyticsNewFilters}
                >
                    {formattedMetric}
                </DrillDownModalTrigger>
            ) : (
                formattedMetric
            )}
        </BodyCell>
    )
}
