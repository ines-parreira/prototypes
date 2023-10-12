import classNames from 'classnames'
import React, {PropsWithRef} from 'react'
import {useCustomerSatisfactionMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/heatmap.less'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/TableConfig'
import {
    getCleanStatsFiltersWithTimezone,
    getHeatmapMode,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'
import {formatMetricValue, NOT_AVAILABLE_PLACEHOLDER} from './common/utils'

export const CustomerSatisfactionCellContent = ({
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
    const {data, isFetching} = useCustomerSatisfactionMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agentId)
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
                formatMetricValue(
                    metricValue,
                    'decimal',
                    NOT_AVAILABLE_PLACEHOLDER
                )
            )}
        </BodyCell>
    )
}
