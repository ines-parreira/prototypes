import { useMemo } from 'react'

import { ConfigurableGraph } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { useSaveCustomDashboardPreference } from 'domains/reporting/hooks/dashboards/useSaveCustomDashboardPreference'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { PERFORMANCE_OVERVIEW_METRIC_FACTORIES } from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import type { PerformanceBarChartMetricConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig'
import { getPerformanceConfigurableBarGraphConfig } from 'domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig'

export const PERFORMANCE_OVERVIEW_CHANNEL_BAR_METRICS: PerformanceBarChartMetricConfig[] =
    [
        {
            measure: 'resolutionTime',
            name: METRIC_TOOLTIPS.resolutionTime.title,
            metricFormat: 'duration',
            dimensions: ['channel'],
            queryFactory: PERFORMANCE_OVERVIEW_METRIC_FACTORIES.resolutionTime,
        },
        {
            measure: 'firstResponseTime',
            name: METRIC_TOOLTIPS.firstResponseTime.title,
            metricFormat: 'duration',
            dimensions: ['channel'],
            queryFactory:
                PERFORMANCE_OVERVIEW_METRIC_FACTORIES.firstResponseTime,
        },
        {
            measure: 'messagesPerTicket',
            name: METRIC_TOOLTIPS.messagesPerTicket.title,
            metricFormat: 'decimal',
            dimensions: ['channel'],
            queryFactory:
                PERFORMANCE_OVERVIEW_METRIC_FACTORIES.messagesPerTicket,
        },
        {
            measure: 'averageCsat',
            name: METRIC_TOOLTIPS.averageCSAT.title,
            metricFormat: 'decimal',
            dimensions: ['channel'],
            queryFactory: PERFORMANCE_OVERVIEW_METRIC_FACTORIES.averageCsat,
        },
    ]

export const PerformanceOverviewConfigurableBarGraph = ({
    chartId,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const metrics = useMemo(
        () =>
            getPerformanceConfigurableBarGraphConfig(
                PERFORMANCE_OVERVIEW_CHANNEL_BAR_METRICS,
                cleanStatsFilters,
                userTimezone,
            ),
        [cleanStatsFilters, userTimezone],
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
