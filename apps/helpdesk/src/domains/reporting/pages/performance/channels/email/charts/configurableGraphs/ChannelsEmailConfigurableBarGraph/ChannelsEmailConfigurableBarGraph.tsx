import { useMemo } from 'react'

import { ConfigurableGraph, ConfigurableGraphType } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    fetchChannelsEmailTicketStatusRows,
    useChannelsEmailTicketStatusBarData,
} from 'domains/reporting/pages/performance/channels/email/hooks/useChannelsEmailTicketStatusBarData'
import type { PerformanceBarChartMetricConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig'
import { getPerformanceWithSubChannelsConfigurableBarGraphConfig } from 'domains/reporting/pages/performance/utils/getPerformanceWithSubChannelsConfigurableBarGraphConfig'

export const CHANNELS_EMAIL_CHANNEL_BAR_METRICS: PerformanceBarChartMetricConfig[] =
    [
        {
            measure: 'ticketsByStatus',
            name: 'Email ticket status',
            metricFormat: 'decimal',
            staticBars: {
                dimensionId: 'overall',
                dimensionName: 'Overall',
                graphType: ConfigurableGraphType.Bar,
                useChartData: useChannelsEmailTicketStatusBarData,
                fetchExportRows: fetchChannelsEmailTicketStatusRows,
                csvMetricName: 'Tickets',
                csvDimensionName: 'Status',
            },
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
