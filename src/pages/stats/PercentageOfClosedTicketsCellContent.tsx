import classNames from 'classnames'
import React, {PropsWithRef} from 'react'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/usePercentageOfClosedTicketsMetricPerAgent'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import useAppSelector from 'hooks/useAppSelector'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import css from 'pages/stats/heatmap.less'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/AgentsTableConfig'
import {
    getCleanStatsFiltersWithTimezone,
    getHeatmapMode,
    isSortingMetricLoading,
} from 'state/ui/stats/agentPerformanceSlice'
import {TableColumn} from 'state/ui/stats/types'
import {buildAgentMetric} from 'state/ui/stats/drillDownSlice'
import {User} from 'config/types/user'
import {DrillDownModalTrigger} from './DrillDownModalTrigger'

export const PercentageOfClosedTicketsCellContent = ({
    agent,
    bodyCellProps,
}: {
    agent: User
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
        String(agent.id)
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
                bodyCellProps?.innerClassName,
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`]
            )}
        >
            {isLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : (
                <DrillDownModalTrigger
                    enabled={false}
                    metricData={buildAgentMetric(
                        TableColumn.PercentageOfClosedTickets,
                        agent
                    )}
                >
                    {formatMetricValue(
                        data?.value,
                        'percent',
                        NOT_AVAILABLE_PLACEHOLDER
                    )}
                </DrillDownModalTrigger>
            )}
        </BodyCell>
    )
}
