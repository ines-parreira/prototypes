import classNames from 'classnames'
import React, {PropsWithRef} from 'react'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {useFirstResponseTimeMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCleanStatsFiltersWithTimezone,
    isSortingMetricLoading,
    selectHeatmapMode,
} from 'state/ui/stats/agentPerformanceSlice'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/heatmap.less'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const FirstResponseTimeCellContent = ({
    agentId,
    bodyCellProps,
}: {
    agentId: number
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const isMetricLoading = useAppSelector(isSortingMetricLoading)
    const {data, isFetching} = useFirstResponseTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agentId)
    )
    const metricValue = data?.value
    const isLoading = isFetching || isMetricLoading
    const isHeatmapMode = useAppSelector(selectHeatmapMode)

    return (
        <BodyCell
            {...bodyCellProps}
            className={classNames(
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`]
            )}
            innerClassName={classNames(
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`]
            )}
        >
            {isFetching || isMetricLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : (
                formatMetricValue(
                    metricValue,
                    'duration',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCell>
    )
}
