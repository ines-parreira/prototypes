import { useMemo } from 'react'

import { ConfigurableGraph } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { useSaveCustomDashboardPreference } from 'domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    channelsVoiceAverageTalkTimeTimeseriesQueryFactoryV2,
    channelsVoiceTotalCallsTimeseriesQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { ChannelsVoiceLineChartMetricConfig } from 'domains/reporting/pages/performance/channels/voice/utils/getChannelsVoiceConfigurableLineGraphConfig'
import { getChannelsVoiceConfigurableLineGraphConfig } from 'domains/reporting/pages/performance/channels/voice/utils/getChannelsVoiceConfigurableLineGraphConfig'

export const CHANNELS_VOICE_LINE_METRICS: ChannelsVoiceLineChartMetricConfig[] =
    [
        {
            measure: 'voiceCallsCount',
            name: METRIC_TOOLTIPS.voiceTotalCalls.title,
            metricFormat: 'decimal',
            dimensions: ['overall', 'callDirection'],
            queryFactory: channelsVoiceTotalCallsTimeseriesQueryFactoryV2,
        },
        {
            measure: 'averageTalkTimeInSeconds',
            name: METRIC_TOOLTIPS.voiceAverageTalkTime.title,
            metricFormat: 'duration',
            dimensions: ['overall', 'callDirection'],
            queryFactory: channelsVoiceAverageTalkTimeTimeseriesQueryFactoryV2,
        },
    ]

export const ChannelsVoiceConfigurableLineGraph = ({
    chartId,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const metrics = useMemo(
        () =>
            getChannelsVoiceConfigurableLineGraphConfig(
                CHANNELS_VOICE_LINE_METRICS,
                cleanStatsFilters,
                userTimezone,
                granularity,
            ),
        [cleanStatsFilters, userTimezone, granularity],
    )

    const { savePreferences } = useSaveCustomDashboardPreference({
        dashboard,
        configId: customDashboardChartSchema?.config_id ?? '',
    })

    const actionMenu =
        chartId && chartConfig ? (
            <ChartsActionMenu
                chartId={chartId}
                dashboard={dashboard}
                chartName={chartConfig.label}
            />
        ) : undefined

    return (
        <ConfigurableGraph
            metrics={metrics}
            analyticsChartId={chartId ?? ''}
            actionMenu={actionMenu}
            customDashboardChartSchema={customDashboardChartSchema}
            onSelect={savePreferences}
        />
    )
}
