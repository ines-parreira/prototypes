import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { BarChartMetricConfig } from 'domains/reporting/utils/configurableChartUtils/barChartConfig'
import {
    createBarChartFetch,
    getBarChartGraphConfig,
} from 'domains/reporting/utils/configurableChartUtils/barChartConfig'

import {
    fetchChannelsVoiceCallOutcomeRows,
    useChannelsVoiceCallOutcomeSankeyData,
} from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/useChannelsVoiceCallOutcomeSankeyData'

// The "Call outcome" funnel has no breakdown dimensions, so it carries no
// `BarChartDimensionDefinition` registry (TDimension is `never`). It is modeled
// as a Sankey metric: rendered from the value query and exported as metric/value
// rows through the same generic bar-chart config.
const CHANNELS_VOICE_CONFIGURABLE_GRAPH_METRICS: BarChartMetricConfig<never>[] =
    [
        {
            measure: 'callOutcome',
            name: 'Call outcome',
            metricFormat: 'decimal',
            sankey: {
                dimensionId: 'overall',
                dimensionName: 'Overall',
                useChartData: useChannelsVoiceCallOutcomeSankeyData,
                fetchExportRows: fetchChannelsVoiceCallOutcomeRows,
                csvMetricName: 'Calls',
                csvDimensionName: 'Call outcome',
                displayProps: {
                    showPercentageWithValue: true,
                    nodeAlign: 'left',
                    verticalAlign: 'top',
                },
            },
        },
    ]

export const getChannelsVoiceConfigurableGraphConfig = (
    statsFilters: StatsFilters,
    timezone: string,
) =>
    getBarChartGraphConfig(
        CHANNELS_VOICE_CONFIGURABLE_GRAPH_METRICS,
        {},
        statsFilters,
        timezone,
    )

export const createChannelsVoiceCallOutcomeFetch = () =>
    createBarChartFetch(CHANNELS_VOICE_CONFIGURABLE_GRAPH_METRICS, {})
