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

// The breakdown dimensions a voice line chart can plot over time, on top of the
// synthetic `overall` single-line view. Extend this union to support a new
// breakdown, add a matching entry to CHANNELS_VOICE_LINE_DIMENSIONS below, then
// list it on a metric's `dimensions`. The metrics' `queryFactory` type enforces
// that every metric's scope actually supports the breakdown dimension.
export type ChannelsVoiceLineDimension = 'callDirection'

export type ChannelsVoiceLineChartMetricConfig =
    LineChartMetricConfig<ChannelsVoiceLineDimension>

const CHANNELS_VOICE_LINE_DIMENSIONS: Record<
    LineChartDimension<ChannelsVoiceLineDimension>,
    LineChartDimensionDefinition
> = {
    overall: {
        label: 'Overall',
        formatName: (value) => value,
    },
    callDirection: {
        label: 'Call direction',
        formatName: (value) => value.charAt(0).toUpperCase() + value.slice(1),
    },
}

export const getChannelsVoiceConfigurableLineGraphConfig = (
    metrics: ChannelsVoiceLineChartMetricConfig[],
    statsFilters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) =>
    getLineChartGraphConfig(
        metrics,
        CHANNELS_VOICE_LINE_DIMENSIONS,
        statsFilters,
        timezone,
        granularity,
    )

export const createChannelsVoiceLineChartFetch = (
    metrics: ChannelsVoiceLineChartMetricConfig[],
) => createLineChartFetch(metrics, CHANNELS_VOICE_LINE_DIMENSIONS)
