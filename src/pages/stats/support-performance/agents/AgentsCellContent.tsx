import { PropsWithRef } from 'react'

import classNames from 'classnames'
import _isNil from 'lodash/isNil'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { User } from 'config/types/user'
import { StatsFilters } from 'models/stat/types'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/common/components/Table/heatmap.less'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
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
        cleanStatsFilters: StatsFilters
        userTimezone: string
    }
    metricFormat: MetricValueFormat
    drillDownMetricData: DrillDownMetric | null
    isHeatmapMode: boolean
    isSortingMetricLoading: boolean
    redirectTo?: string
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
    const { cleanStatsFilters, userTimezone } = statsFilters
    const { data, isFetching } = useMetricPerAgentQueryHook(
        cleanStatsFilters,
        userTimezone,
        undefined,
        String(agent.id),
    )
    const metricValue = data?.value
    const decile = data?.decile
    const isLoading = isFetching || isSortingMetricLoading
    const formattedMetric = formatMetricValue(
        metricValue,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    const heatmapLevel =
        metricValue &&
        !_isNil(decile) &&
        isHeatmapMode &&
        !isLoading &&
        css[`p${decile}`]

    return (
        <BodyCell
            {...bodyCellProps}
            className={classNames([css.heatmap], heatmapLevel)}
            innerClassName={classNames(
                bodyCellProps?.innerClassName,
                [css.heatmap],
                heatmapLevel,
            )}
        >
            {isLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : drillDownMetricData !== null ? (
                <DrillDownModalTrigger
                    enabled={!!metricValue}
                    highlighted={!isHeatmapMode}
                    metricData={drillDownMetricData}
                >
                    {formattedMetric}
                </DrillDownModalTrigger>
            ) : (
                formattedMetric
            )}
        </BodyCell>
    )
}
