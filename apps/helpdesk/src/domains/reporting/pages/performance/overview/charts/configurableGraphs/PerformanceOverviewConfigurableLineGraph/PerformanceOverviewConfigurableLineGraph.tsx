import { useMemo } from 'react'

import { ConfigurableGraph } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { useSaveCustomDashboardPreference } from 'domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { firstResponseTimeTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { messagesPerTicketTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { resolutionTimeTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { averageCsatTimeseriesQueryFactoryV2 } from 'domains/reporting/models/scopes/satisfactionSurveys'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { PerformanceLineChartMetricConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableLineGraphConfig'
import { getPerformanceConfigurableLineGraphConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableLineGraphConfig'

export const PERFORMANCE_OVERVIEW_CHANNEL_LINE_METRICS: PerformanceLineChartMetricConfig[] =
    [
        {
            measure: 'resolutionTime',
            name: METRIC_TOOLTIPS.resolutionTime.title,
            metricFormat: 'duration',
            dimensions: ['overall', 'channel'],
            queryFactory: resolutionTimeTimeseriesQueryFactoryV2,
        },
        {
            measure: 'firstResponseTime',
            name: METRIC_TOOLTIPS.firstResponseTime.title,
            metricFormat: 'duration',
            dimensions: ['overall', 'channel'],
            queryFactory: firstResponseTimeTimeseriesQueryFactoryV2,
        },
        {
            measure: 'messagesPerTicket',
            name: METRIC_TOOLTIPS.messagesPerTicket.title,
            metricFormat: 'decimal',
            dimensions: ['overall', 'channel'],
            queryFactory: messagesPerTicketTimeseriesQueryFactoryV2,
        },
        {
            measure: 'averageCsat',
            name: METRIC_TOOLTIPS.averageCSAT.title,
            metricFormat: 'decimal',
            dimensions: ['overall', 'channel'],
            queryFactory: averageCsatTimeseriesQueryFactoryV2,
        },
    ]

export const PerformanceOverviewConfigurableLineGraph = ({
    chartId,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const metrics = useMemo(
        () =>
            getPerformanceConfigurableLineGraphConfig(
                PERFORMANCE_OVERVIEW_CHANNEL_LINE_METRICS,
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
