import React, { ReactNode } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    isMetricTrendWithCurrency,
    MetricTrendHook,
} from 'domains/reporting/hooks/useMetricTrend'
import { TrendMetric } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { TooltipData } from 'domains/reporting/pages/types'
import { getBadgeTooltipForPreviousPeriod } from 'domains/reporting/pages/utils'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
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
