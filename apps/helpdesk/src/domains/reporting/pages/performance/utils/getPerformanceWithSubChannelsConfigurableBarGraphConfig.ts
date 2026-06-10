import { ConfigurableGraphType } from '@repo/reporting'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    PerformanceBarChartMetricConfig,
    PerformanceBarDimension,
} from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig'
import type { BarChartDimensionDefinition } from 'domains/reporting/utils/configurableChartUtils/barChartConfig'
import {
    createBarChartFetch,
    getBarChartGraphConfig,
} from 'domains/reporting/utils/configurableChartUtils/barChartConfig'
import { humanizeChannel } from 'state/ticket/utils'

// On the Channels pages the `channel` breakdown maps to sub-channels, so the
// dimension is labelled "Sub-channel" instead of the Overview "Channel".
// These will be used for the Email and Social tabs only, where we have sub-channels.
const PERFORMANCE_WITH_SUB_CHANNELS_BAR_DIMENSIONS: Record<
    PerformanceBarDimension,
    BarChartDimensionDefinition
> = {
    channel: {
        label: 'Sub-channel',
        graphType: ConfigurableGraphType.HorizontalBar,
        formatName: (value) => humanizeChannel(value),
    },
}

export const getPerformanceWithSubChannelsConfigurableBarGraphConfig = (
    metrics: PerformanceBarChartMetricConfig[],
    statsFilters: StatsFilters,
    timezone: string,
) =>
    getBarChartGraphConfig(
        metrics,
        PERFORMANCE_WITH_SUB_CHANNELS_BAR_DIMENSIONS,
        statsFilters,
        timezone,
    )

export const createPerformanceWithSubChannelsBarChartFetch = (
    metrics: PerformanceBarChartMetricConfig[],
) => createBarChartFetch(metrics, PERFORMANCE_WITH_SUB_CHANNELS_BAR_DIMENSIONS)
