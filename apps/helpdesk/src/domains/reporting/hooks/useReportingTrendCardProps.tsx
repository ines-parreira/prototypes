import { useMemo } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    ChartConfig,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

export const useReportingTrendCardProps = ({
    chartConfig,
    chartId,
    dashboard,
    useTrend,
    isAiAgentTrendCard,
}: {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig: ChartConfig
    useTrend: MetricTrendHook
    isAiAgentTrendCard: boolean
}) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const aiAgentFilters = useMemo(() => {
        return {
            period: cleanStatsFilters.period,
        }
    }, [cleanStatsFilters])

    const filters = isAiAgentTrendCard ? aiAgentFilters : cleanStatsFilters

    const trendData = useTrend(filters, userTimezone)

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
    }
}
