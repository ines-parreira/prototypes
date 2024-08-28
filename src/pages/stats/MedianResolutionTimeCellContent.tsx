import classNames from 'classnames'
import React, {PropsWithRef} from 'react'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useMedianResolutionTimeMetricPerAgent} from 'hooks/reporting/metricsPerAgent'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/heatmap.less'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/AgentsTableConfig'
import {
    getHeatmapMode,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {buildAgentMetric} from 'state/ui/stats/drillDownSlice'
import {User} from 'config/types/user'
import {DrillDownModalTrigger} from './DrillDownModalTrigger'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const MedianResolutionTimeCellContent = ({
    agent,
    bodyCellProps,
}: {
    agent: User
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) => {
    const {isAnalyticsNewFilters, cleanStatsFilters, userTimezone} =
        useNewStatsFilters()
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useMedianResolutionTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agent.id)
    )
    const metricValue = data?.value
    const isLoading = isFetching || isMetricLoading
    const isHeatmapMode = useAppSelector(getHeatmapMode)

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
            ) : (
                <DrillDownModalTrigger
                    enabled={!!metricValue}
                    metricData={buildAgentMetric(
                        AgentsTableColumn.MedianResolutionTime,
                        agent
                    )}
                    useNewFilterData={isAnalyticsNewFilters}
                >
                    {formatMetricValue(
                        metricValue,
                        'duration',
                        NOT_AVAILABLE_PLACEHOLDER
                    )}
                </DrillDownModalTrigger>
            )}
        </BodyCell>
    )
}
