import { useMemo } from 'react'

import { ConfigurableGraph, ConfigurableGraphType } from '@repo/reporting'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

import { useChannelsVoiceCallOutcomeSankeyData } from 'domains/reporting/pages/performance/channels/voice/charts/configurableGraphs/ChannelsVoiceConfigurableGraph/useChannelsVoiceCallOutcomeSankeyData'

export const ChannelsVoiceConfigurableGraph = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const metrics = useMemo<ConfigurableGraphMetricConfig[]>(
        () => [
            {
                measure: 'callOutcome',
                name: 'Call outcome',
                metricFormat: 'decimal',
                dimensions: [
                    {
                        id: 'overall',
                        name: 'Overall',
                        configurableGraphType: ConfigurableGraphType.Sankey,
                        showPercentageWithValue: true,
                        nodeAlign: 'left',
                        verticalAlign: 'top',
                        useChartData: () =>
                            useChannelsVoiceCallOutcomeSankeyData(
                                cleanStatsFilters,
                                userTimezone,
                            ),
                    },
                ],
            },
        ],
        [cleanStatsFilters, userTimezone],
    )

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
        />
    )
}
