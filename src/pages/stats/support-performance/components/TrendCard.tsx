import React, {ReactNode} from 'react'
import blueStar from 'assets/img/icons/blue-star.svg'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import useAppSelector from 'hooks/useAppSelector'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {formatMetricValue, MetricTrendFormat} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import {NoDataTooltip} from 'pages/stats/support-performance/components/NoDataTooltip'
import css from 'pages/stats/SupportPerformanceOverview.less'
import TrendBadge from 'pages/stats/TrendBadge'
import {TooltipData} from 'pages/stats/types'
import {getBadgeTooltipForPreviousPeriod} from 'pages/stats/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {OverviewMetric} from 'state/ui/stats/types'

export const TrendCard = ({
    hint,
    title,
    useTrend,
    overviewMetric,
    tip,
    interpretAs,
    withFrom,
    metricFormat,
}: {
    useTrend: MetricTrendHook
    hint: TooltipData
    title: string
    overviewMetric: OverviewMetric
    tip?: ReactNode
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    withFrom: boolean
    metricFormat?: MetricTrendFormat
}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const trend = useTrend(cleanStatsFilters, userTimezone)
    const periodComparisonTooltipText =
        getBadgeTooltipForPreviousPeriod(cleanStatsFilters)

    return (
        <MetricCard
            hint={hint}
            title={title}
            isLoading={trend.isFetching}
            trendBadge={
                <TrendBadge
                    format={'percent'}
                    interpretAs={interpretAs}
                    isLoading={!trend.data}
                    tooltip={periodComparisonTooltipText}
                    value={trend.data?.value}
                    prevValue={trend.data?.prevValue}
                />
            }
            tip={tip}
        >
            <BigNumberMetric
                isLoading={!trend.data}
                from={
                    withFrom &&
                    formatMetricValue(trend.data?.prevValue, metricFormat)
                }
            >
                <DrillDownModalTrigger
                    enabled={!!trend.data?.value}
                    metricData={{
                        title,
                        metricName: overviewMetric,
                    }}
                >
                    {formatMetricValue(trend.data?.value, metricFormat)}
                </DrillDownModalTrigger>
                {!trend.data?.value ? (
                    <NoDataTooltip />
                ) : (
                    overviewMetric === OverviewMetric.CustomerSatisfaction && (
                        <img
                            className={css.customerSatisfactionStar}
                            src={blueStar}
                            alt="Blue star"
                        />
                    )
                )}
            </BigNumberMetric>
        </MetricCard>
    )
}
