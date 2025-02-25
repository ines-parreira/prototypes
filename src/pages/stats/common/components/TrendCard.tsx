import React, { ReactNode } from 'react'

import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { MetricTrendHook } from 'hooks/reporting/useMetricTrend'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { TooltipData } from 'pages/stats/types'
import { getBadgeTooltipForPreviousPeriod } from 'pages/stats/utils'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'
import {
    AutoQAMetric,
    SatisfactionMetric,
    SlaMetric,
} from 'state/ui/stats/types'

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
    tip?: ReactNode
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat?: MetricTrendFormat
} & DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, isAnalyticsNewFilters } =
        useNewStatsFilters()

    const trend = useTrend(cleanStatsFilters, userTimezone)
    const formattedMetric = formatMetricValue(
        trend.data?.value,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
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
                        useNewFilterData={isAnalyticsNewFilters}
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
