import { useMemo } from 'react'

import { ConfigurableGraph } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { channelsEmailFirstResponseTimeBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { channelsEmailMessagesPerTicketBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { channelsEmailResolutionTimeBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { channelsEmailCreatedTicketsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { PerformanceBarChartMetricConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig'
import { getPerformanceWithSubChannelsConfigurableBarGraphConfig } from 'domains/reporting/pages/performance/utils/getPerformanceWithSubChannelsConfigurableBarGraphConfig'

export const CHANNELS_EMAIL_CHANNEL_BAR_METRICS: PerformanceBarChartMetricConfig[] =
    [
        {
            measure: 'createdTickets',
            name: 'Email tickets created',
            metricFormat: 'decimal',
            dimensions: ['channel'],
            queryFactory: channelsEmailCreatedTicketsBreakdownQueryFactoryV2,
        },
        {
            measure: 'resolutionTime',
            name: METRIC_TOOLTIPS.resolutionTime.title,
            metricFormat: 'duration',
            dimensions: ['channel'],
            queryFactory: channelsEmailResolutionTimeBreakdownQueryFactoryV2,
        },
        {
            measure: 'firstResponseTime',
            name: METRIC_TOOLTIPS.firstResponseTime.title,
            metricFormat: 'duration',
            dimensions: ['channel'],
            queryFactory: channelsEmailFirstResponseTimeBreakdownQueryFactoryV2,
        },
        {
            measure: 'messagesPerTicket',
            name: METRIC_TOOLTIPS.messagesPerTicket.title,
            metricFormat: 'decimal',
            dimensions: ['channel'],
            queryFactory: channelsEmailMessagesPerTicketBreakdownQueryFactoryV2,
        },
    ]

export const ChannelsEmailConfigurableBarGraph = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const metrics = useMemo(
        () =>
            getPerformanceWithSubChannelsConfigurableBarGraphConfig(
                CHANNELS_EMAIL_CHANNEL_BAR_METRICS,
                cleanStatsFilters,
                userTimezone,
            ),
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
