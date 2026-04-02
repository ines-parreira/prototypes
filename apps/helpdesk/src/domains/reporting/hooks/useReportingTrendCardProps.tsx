import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { formatMetricValue } from '@repo/reporting'

import { useAiAgentTrendCardDrillDown } from 'domains/reporting/hooks/drill-down/useAiAgentTrendCardDrillDown'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

import { useOverallTimeSeries } from '../../../pages/aiAgent/utils/aiAgentMetrics.utils'
import type { MetricQueryFactory } from '../models/scopes/scope'

export const useReportingTrendCardProps = ({
    chartConfig,
    chartId,
    dashboard,
    useTrend,
    isAiAgentTrendCard,
    drillDownMetricName,
    timeSeriesView,
}: {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig: ChartConfig
    useTrend: MetricTrendHook
    isAiAgentTrendCard: boolean
    drillDownMetricName?: DrillDownMetric['metricName']
    timeSeriesView?: { comingSoon?: boolean; queryFactory?: MetricQueryFactory }
}) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const aiAgentFilters = useMemo(() => {
        return {
            period: cleanStatsFilters.period,
        }
    }, [cleanStatsFilters])

    const filters = isAiAgentTrendCard ? aiAgentFilters : cleanStatsFilters

    const trendData = useTrend(filters, userTimezone)

    const drillDown = useAiAgentTrendCardDrillDown(
        { metricName: drillDownMetricName, title: chartConfig.label },
        trendData.data?.value,
    )

    const { value: isTimeSeriesFFEnabled, isLoading: isFFLoading } =
        useFlagWithLoading(
            FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCardsWithTimeseries,
        )
    const isTimeSeriesEnabled =
        isAiAgentTrendCard && isTimeSeriesFFEnabled && !isFFLoading

    const trend = useMemo(
        () => ({
            isFetching: trendData.isFetching,
            isError: trendData.isError,
            data: {
                label: chartConfig.label,
                value: trendData.data?.value || 0,
                prevValue: trendData.data?.prevValue || 0,
            },
        }),
        [trendData, chartConfig.label],
    )

    const timeSeriesViewProps = useMemo(() => {
        if (!timeSeriesView || !isTimeSeriesEnabled) {
            return undefined
        }

        const { queryFactory } = timeSeriesView
        return {
            comingSoon: timeSeriesView.comingSoon ?? false,
            useChartData: queryFactory
                ? () =>
                      useOverallTimeSeries(
                          queryFactory,
                          filters,
                          userTimezone,
                          granularity,
                      )
                : undefined,
            valueFormatter: (value: number) =>
                formatMetricValue(value, chartConfig.metricFormat),
        }
    }, [
        timeSeriesView,
        isTimeSeriesEnabled,
        filters,
        userTimezone,
        granularity,
        chartConfig.metricFormat,
    ])

    return {
        trend,
        isLoading: trendData.isFetching,
        metricFormat: chartConfig.metricFormat,
        interpretAs: chartConfig.interpretAs || 'more-is-better',
        trendBadgeTooltipData: { period: formatPreviousPeriod(filters.period) },
        withBorder: true,
        withFixedWidth: false,
        hint: {
            title: chartConfig.label,
            caption: chartConfig.description,
        },
        actionMenu: chartId ? (
            <ChartsActionMenu
                chartId={chartId}
                dashboard={dashboard}
                chartName={chartConfig.label}
            />
        ) : undefined,
        drillDown,
        timeSeriesView: timeSeriesViewProps,
    }
}
