import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import type {
    LineChartDimension,
    LineChartDimensionDefinition,
    LineChartMetricConfig,
} from 'domains/reporting/utils/configurableChartUtils/lineChartConfig'
import {
    createLineChartFetch,
    getLineChartGraphConfig,
} from 'domains/reporting/utils/configurableChartUtils/lineChartConfig'
import { humanizeChannel } from 'state/ticket/utils'

// The breakdown dimensions a performance line chart can plot over time, on top of
// the synthetic `overall` single-line view. Extend this union to support a new
// breakdown, add a matching entry to PERFORMANCE_LINE_DIMENSIONS below, then list
// it on a metric's `dimensions`. The metrics' `queryFactory` type enforces that
// every metric's scope actually supports the breakdown dimension.
export type PerformanceLineDimension = 'channel'

export type PerformanceLineChartMetricConfig =
    LineChartMetricConfig<PerformanceLineDimension>

const PERFORMANCE_LINE_DIMENSIONS: Record<
    LineChartDimension<PerformanceLineDimension>,
    LineChartDimensionDefinition
> = {
    overall: {
        label: 'Overall',
        formatName: (value) => value,
    },
    channel: {
        label: 'Channel',
        formatName: (value) => humanizeChannel(value),
    },
}

export const getPerformanceConfigurableLineGraphConfig = (
    metrics: PerformanceLineChartMetricConfig[],
    statsFilters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) =>
    getLineChartGraphConfig(
        metrics,
        PERFORMANCE_LINE_DIMENSIONS,
        statsFilters,
        timezone,
        granularity,
    )

export const createPerformanceLineChartFetch = (
    metrics: PerformanceLineChartMetricConfig[],
) => createLineChartFetch(metrics, PERFORMANCE_LINE_DIMENSIONS)
