import { useMemo } from 'react'

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
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

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
    outcomeCustomFieldId,
    assigneeUserId,
}: {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig: ChartConfig
    useTrend: MetricTrendHook
    isAiAgentTrendCard: boolean
    drillDownMetricName?: DrillDownMetric['metricName']
    outcomeCustomFieldId?: number
    assigneeUserId?: number
    timeSeriesView?: {
        disabled?: boolean
        comingSoon?: boolean
        queryFactory?: MetricQueryFactory
        valueFormatter?: (value: number) => string
        valueTransform?: (value: number | null) => number | null
    }
}) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const { statsFilters: aiAgentFilters } = useAiAgentStatsFilters()

    const filters = isAiAgentTrendCard ? aiAgentFilters : cleanStatsFilters

    const trendData = useTrend(filters, userTimezone)

    const drillDown = useAiAgentTrendCardDrillDown({
        metricName: drillDownMetricName,
        title: chartConfig.label,
        outcomeCustomFieldId,
        assigneeUserId,
    })

    const trend = useMemo(
        () => ({
            isFetching: trendData.isFetching,
            isError: trendData.isError,
            data: {
                label: chartConfig.label,
                value: trendData.data?.value ?? null,
                prevValue: trendData.data?.prevValue ?? null,
            },
        }),
        [trendData, chartConfig.label],
    )

    const timeSeriesViewProps = useMemo(() => {
        if (timeSeriesView?.disabled) {
            return undefined
        }

        if (!timeSeriesView) {
            return {
                comingSoon: true,
            }
        }

        const { queryFactory, valueFormatter, valueTransform } = timeSeriesView
        return {
            comingSoon: timeSeriesView.comingSoon ?? false,
            useChartData: queryFactory
                ? () =>
                      useOverallTimeSeries(
                          queryFactory,
                          filters,
                          userTimezone,
                          granularity,
                          valueTransform,
                      )
                : undefined,
            valueFormatter: valueFormatter
                ? valueFormatter
                : (value: number) =>
                      formatMetricValue(value, chartConfig.metricFormat),
        }
    }, [
        timeSeriesView,
        filters,
        userTimezone,
        granularity,
        chartConfig.metricFormat,
    ])

    return {
        trend,
        metricFormat: chartConfig.metricFormat,
        interpretAs: chartConfig.interpretAs || 'more-is-better',
        trendBadgeTooltipData: { period: formatPreviousPeriod(filters.period) },
        withBorder: true,
        withFixedWidth: false,
        hint: chartConfig.tooltipConfig
            ? { ...chartConfig.tooltipConfig, title: chartConfig.label }
            : { title: chartConfig.label, caption: chartConfig.description },
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
