import React, {ReactNode} from 'react'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import useAppSelector from 'hooks/useAppSelector'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {TooltipData} from 'pages/stats/types'
import {getBadgeTooltipForPreviousPeriod} from 'pages/stats/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {OverviewMetric} from 'state/ui/stats/types'

export const TREND_BADGE_FORMAT = 'percent'

export const TrendCard = ({
    hint,
    title,
    useTrend,
    overviewMetric,
    tip,
    interpretAs,
    metricFormat,
}: {
    useTrend: MetricTrendHook
    hint: TooltipData
    title: string
    overviewMetric: OverviewMetric
    tip?: ReactNode
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat?: MetricTrendFormat
}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const trend = useTrend(cleanStatsFilters, userTimezone)

    return (
        <MetricCard
            hint={hint}
            title={title}
            isLoading={trend.isFetching}
            tip={tip}
        >
            <BigNumberMetric
                isLoading={!trend.data}
                trendBadge={
                    <TrendBadge
                        format={TREND_BADGE_FORMAT}
                        interpretAs={interpretAs}
                        isLoading={!trend.data}
                        value={trend.data?.value}
                        prevValue={trend.data?.prevValue}
                        tooltipData={{
                            period: getBadgeTooltipForPreviousPeriod(
                                cleanStatsFilters
                            ),
                        }}
                    />
                }
            >
                <DrillDownModalTrigger
                    enabled={!!trend.data?.value}
                    metricData={{
                        title,
                        metricName: overviewMetric,
                    }}
                >
                    {formatMetricValue(
                        trend.data?.value,
                        metricFormat,
                        NOT_AVAILABLE_PLACEHOLDER
                    )}
                </DrillDownModalTrigger>
            </BigNumberMetric>
        </MetricCard>
    )
}
