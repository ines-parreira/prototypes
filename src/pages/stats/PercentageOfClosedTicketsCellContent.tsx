import classNames from 'classnames'
import React, {PropsWithRef} from 'react'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import css from 'pages/stats/heatmap.less'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {
    getCleanStatsFiltersWithTimezone,
    getHeatmapMode,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'

export const PercentageOfClosedTicketsCellContent = ({
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
    const {data, isFetching} = usePercentageOfClosedTicketsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agentId)
    )
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
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`]
            )}
        >
            {isLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : (
                formatMetricValue(
                    data?.value,
                    'percent',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCell>
    )
}
