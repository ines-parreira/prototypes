import { useMemo } from 'react'

import { ConfigurableGraph } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { channelsEmailFirstResponseTimeTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { channelsEmailMessagesPerTicketTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { channelsEmailResolutionTimeTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { channelsEmailCreatedTicketsTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { PerformanceLineChartMetricConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableLineGraphConfig'
import { getPerformanceWithSubChannelsConfigurableLineGraphConfig } from 'domains/reporting/pages/performance/utils/getPerformanceWithSubChannelsConfigurableLineGraphConfig'

export const CHANNELS_EMAIL_CHANNEL_LINE_METRICS: PerformanceLineChartMetricConfig[] =
    [
        {
            measure: 'createdTickets',
            name: 'Email tickets created',
            metricFormat: 'decimal',
            dimensions: ['overall', 'channel'],
            queryFactory: channelsEmailCreatedTicketsTimeseriesQueryFactoryV2,
        },
        {
            measure: 'resolutionTime',
            name: METRIC_TOOLTIPS.resolutionTime.title,
            metricFormat: 'duration',
            dimensions: ['overall', 'channel'],
            queryFactory: channelsEmailResolutionTimeTimeseriesQueryFactoryV2,
        },
        {
            measure: 'firstResponseTime',
            name: METRIC_TOOLTIPS.firstResponseTime.title,
            metricFormat: 'duration',
            dimensions: ['overall', 'channel'],
            queryFactory:
                channelsEmailFirstResponseTimeTimeseriesQueryFactoryV2,
        },
        {
            measure: 'messagesPerTicket',
            name: METRIC_TOOLTIPS.messagesPerTicket.title,
            metricFormat: 'decimal',
            dimensions: ['overall', 'channel'],
            queryFactory:
                channelsEmailMessagesPerTicketTimeseriesQueryFactoryV2,
        },
    ]

export const ChannelsEmailConfigurableLineGraph = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const metrics = useMemo(
        () =>
            getPerformanceWithSubChannelsConfigurableLineGraphConfig(
                CHANNELS_EMAIL_CHANNEL_LINE_METRICS,
                cleanStatsFilters,
                userTimezone,
                granularity,
            ),
        [cleanStatsFilters, userTimezone, granularity],
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
