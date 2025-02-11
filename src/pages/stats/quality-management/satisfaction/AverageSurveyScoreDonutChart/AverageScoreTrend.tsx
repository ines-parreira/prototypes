import React from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {OverviewMetric} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {getBadgeTooltipForPreviousPeriod} from 'pages/stats/utils'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {AutoQAMetric, SatisfactionMetric, SlaMetric} from 'state/ui/stats/types'

type Props = {
    useTrend: MetricTrendHook
    title?: string
    drillDownMetric?:
        | OverviewMetric
        | SlaMetric
        | AutoQAMetric
        | SatisfactionMetric
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat?: MetricTrendFormat
    className?: string
}

export const AverageScoreTrend = ({
    title,
    useTrend,
    drillDownMetric,
    interpretAs,
    metricFormat,
    className,
}: Props) => {
    const {cleanStatsFilters, userTimezone, isAnalyticsNewFilters} =
        useNewStatsFilters()

    const trend = useTrend(cleanStatsFilters, userTimezone)
    const formattedMetric = formatMetricValue(
        trend.data?.value,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER
    )

    return (
        <BigNumberMetric
            className={className}
            isLoading={!trend.data}
            trendBadge={
                <TrendBadge
                    interpretAs={interpretAs}
                    isLoading={!trend.data}
                    value={trend.data?.value}
                    prevValue={trend.data?.prevValue}
                    tooltipData={{
                        period: getBadgeTooltipForPreviousPeriod(
                            cleanStatsFilters.period
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
    )
}
