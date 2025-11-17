import type { PropsWithRef } from 'react'

import classNames from 'classnames'
import _isNil from 'lodash/isNil'

import { Skeleton } from '@gorgias/axiom'

import type { User } from 'config/types/user'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/common/components/Table/heatmap.less'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import type { MetricQueryPerAgentQuery } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { METRIC_COLUMN_WIDTH } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { Props as BodyCellProps } from 'pages/common/components/table/cells/BodyCell'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

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
