import type { ReactNode } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import { isMetricTrendWithCurrency } from 'domains/reporting/hooks/useMetricTrend'
import { useShouldIncludeBots } from 'domains/reporting/hooks/useShouldIncludeBots'
import type { TrendMetric } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { TooltipData } from 'domains/reporting/pages/types'
import { getBadgeTooltipForPreviousPeriod } from 'domains/reporting/pages/utils'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type {
    AutoQAMetric,
    SatisfactionMetric,
    SlaMetric,
} from 'domains/reporting/state/ui/stats/types'

export const TrendCard = ({
    hint,
    title,
    useTrend,
    drillDownMetric,
    tip,
    interpretAs,
    metricFormat,
    chartId,
    dashboard,
}: {
    useTrend: MetricTrendHook
    hint?: TooltipData
    title: string
    drillDownMetric?:
        | OverviewMetric
        | SlaMetric
        | AutoQAMetric
        | SatisfactionMetric
        | TrendMetric
    tip?: ReactNode
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat?: MetricTrendFormat
} & DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const trend = useTrend(cleanStatsFilters, userTimezone)
    const formattedMetric = formatMetricValue(
        trend.data?.value,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
        isMetricTrendWithCurrency(trend) ? trend?.data?.currency : undefined,
    )

    const shouldIncludeBots = useShouldIncludeBots()

    return (
        <MetricCard
            hint={hint}
            title={title}
            isLoading={trend.isFetching}
            dashboard={dashboard}
            chartId={chartId}
            tip={tip}
        >
            <BigNumberMetric
                isLoading={!trend.data}
                trendBadge={
                    <TrendBadge
                        interpretAs={interpretAs}
                        isLoading={!trend.data}
                        value={trend.data?.value}
                        prevValue={trend.data?.prevValue}
                        tooltipData={{
                            period: getBadgeTooltipForPreviousPeriod(
                                cleanStatsFilters.period,
                            ),
                        }}
                        metricFormat={metricFormat}
                    />
                }
            >
                {drillDownMetric ? (
                    <DrillDownModalTrigger
                        enabled={!!trend.data?.value}
                        metricData={
                            {
                                title,
                                metricName: drillDownMetric,
                                shouldIncludeBots,
                            } as DrillDownMetric
                        }
                    >
                        {formattedMetric}
                    </DrillDownModalTrigger>
                ) : (
                    formattedMetric
                )}
            </BigNumberMetric>
        </MetricCard>
    )
}
