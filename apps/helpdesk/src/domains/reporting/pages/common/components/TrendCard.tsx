import type { ReactNode } from 'react'

import { DrillDownModalTrigger } from '@repo/reporting'

import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import { isMetricTrendWithCurrency } from 'domains/reporting/hooks/useMetricTrend'
import type { TrendMetric } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
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
    VoiceMetric,
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
    titleExtra,
}: {
    useTrend: MetricTrendHook
    hint?: TooltipData
    title: string
    drillDownMetric?:
        | OverviewMetric
        | SlaMetric
        | VoiceMetric
        | AutoQAMetric
        | SatisfactionMetric
        | TrendMetric
    tip?: ReactNode
    titleExtra?: ReactNode
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
    const drillDown = useDrillDownModalTrigger({
        title,
        metricName: drillDownMetric as DrillDownMetric['metricName'],
    })

    return (
        <MetricCard
            hint={hint}
            title={title}
            isLoading={trend.isFetching}
            dashboard={dashboard}
            chartId={chartId}
            tip={tip}
            titleExtra={titleExtra}
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
                        {...drillDown}
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
