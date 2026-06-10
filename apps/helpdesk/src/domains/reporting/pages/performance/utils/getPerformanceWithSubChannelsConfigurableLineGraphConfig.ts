import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import type {
    PerformanceLineChartMetricConfig,
    PerformanceLineDimension,
} from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableLineGraphConfig'
import type {
    LineChartDimension,
    LineChartDimensionDefinition,
} from 'domains/reporting/utils/configurableChartUtils/lineChartConfig'
import {
    createLineChartFetch,
    getLineChartGraphConfig,
} from 'domains/reporting/utils/configurableChartUtils/lineChartConfig'
import { humanizeChannel } from 'state/ticket/utils'

// On the Channels pages the `channel` breakdown maps to sub-channels, so the
// dimension is labelled "Sub-channel" instead of the Overview "Channel".
const PERFORMANCE_WITH_SUB_CHANNELS_LINE_DIMENSIONS: Record<
    LineChartDimension<PerformanceLineDimension>,
    LineChartDimensionDefinition
> = {
    overall: {
        label: 'Overall',
        formatName: (value) => value,
    },
    channel: {
        label: 'Sub-channel',
        formatName: (value) => humanizeChannel(value),
    },
}

export const getPerformanceWithSubChannelsConfigurableLineGraphConfig = (
    metrics: PerformanceLineChartMetricConfig[],
    statsFilters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) =>
    getLineChartGraphConfig(
        metrics,
        PERFORMANCE_WITH_SUB_CHANNELS_LINE_DIMENSIONS,
        statsFilters,
        timezone,
        granularity,
    )

export const createPerformanceWithSubChannelsLineChartFetch = (
    metrics: PerformanceLineChartMetricConfig[],
) =>
    createLineChartFetch(metrics, PERFORMANCE_WITH_SUB_CHANNELS_LINE_DIMENSIONS)
