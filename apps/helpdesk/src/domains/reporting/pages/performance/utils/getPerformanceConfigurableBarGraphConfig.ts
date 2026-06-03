import { ConfigurableGraphType } from '@repo/reporting'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    BarChartDimensionDefinition,
    BarChartMetricConfig,
} from 'domains/reporting/utils/configurableChartUtils/barChartConfig'
import {
    createBarChartFetch,
    getBarChartGraphConfig,
} from 'domains/reporting/utils/configurableChartUtils/barChartConfig'
import { humanizeChannel } from 'state/ticket/utils'

// The dimensions a performance bar chart can break down by. Extend this union
// to support a new dimension, add a matching entry to PERFORMANCE_BAR_DIMENSIONS
// below, then list it on a metric's `dimensions`. The metrics' `queryFactory`
// type enforces that every metric's scope actually supports the dimension.
export type PerformanceBarDimension = 'channel'

export type PerformanceBarChartMetricConfig =
    BarChartMetricConfig<PerformanceBarDimension>

const PERFORMANCE_BAR_DIMENSIONS: Record<
    PerformanceBarDimension,
    BarChartDimensionDefinition
> = {
    channel: {
        label: 'Channel',
        graphType: ConfigurableGraphType.Bar,
        formatName: (value) => humanizeChannel(value),
    },
}

export const getPerformanceConfigurableBarGraphConfig = (
    metrics: PerformanceBarChartMetricConfig[],
    statsFilters: StatsFilters,
    timezone: string,
) =>
    getBarChartGraphConfig(
        metrics,
        PERFORMANCE_BAR_DIMENSIONS,
        statsFilters,
        timezone,
    )

export const createPerformanceBarChartFetch = (
    metrics: PerformanceBarChartMetricConfig[],
) => createBarChartFetch(metrics, PERFORMANCE_BAR_DIMENSIONS)
