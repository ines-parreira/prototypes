import React, { PropsWithRef } from 'react'

import classNames from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { User } from 'config/types/user'
import { StatsFilters } from 'models/stat/types'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import {
    formatMetricValue,
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import css from 'pages/stats/heatmap.less'
import {
    METRIC_COLUMN_WIDTH,
    MetricQueryPerAgentQuery,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'

export type AgentsCellContentProps = {
    agent: User
    bodyCellProps?: PropsWithRef<BodyCellProps>
    useMetricPerAgentQueryHook: MetricQueryPerAgentQuery
    statsFilters: {
        isAnalyticsNewFilters: boolean
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
    metricFormat: MetricValueFormat
    drillDownMetricData: DrillDownMetric | null
    isHeatmapMode: boolean
    isSortingMetricLoading: boolean
}

export const AgentsCellContent = ({
    agent,
    bodyCellProps,
    useMetricPerAgentQueryHook,
    statsFilters,
    metricFormat,
    drillDownMetricData,
    isHeatmapMode,
    isSortingMetricLoading,
}: AgentsCellContentProps) => {
    const { isAnalyticsNewFilters, cleanStatsFilters, userTimezone } =
        statsFilters
    const { data, isFetching } = useMetricPerAgentQueryHook(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agent.id),
    )
    const metricValue = data?.value
    const isLoading = isFetching || isSortingMetricLoading
    const formattedMetric = formatMetricValue(
        metricValue,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    return (
        <BodyCell
            {...bodyCellProps}
            className={classNames(
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`],
            )}
            innerClassName={classNames(
                bodyCellProps?.innerClassName,
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(data?.decile)}`],
            )}
        >
            {isLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : drillDownMetricData !== null ? (
                <DrillDownModalTrigger
                    enabled={!!metricValue}
                    highlighted
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
