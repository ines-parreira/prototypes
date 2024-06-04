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
import {OverviewMetric, SlaMetric} from 'state/ui/stats/types'

export const TrendCard = ({
    hint,
    title,
    useTrend,
    drillDownMetric,
    tip,
    interpretAs,
    metricFormat,
}: {
    useTrend: MetricTrendHook
    hint: TooltipData
    title: string
    drillDownMetric?: OverviewMetric | SlaMetric
    tip?: ReactNode
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat?: MetricTrendFormat
}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const trend = useTrend(cleanStatsFilters, userTimezone)
    const formattedMetric = formatMetricValue(
        trend.data?.value,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER
    )

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
                        interpretAs={interpretAs}
                        isLoading={!trend.data}
                        value={trend.data?.value}
                        prevValue={trend.data?.prevValue}
                        tooltipData={{
                            period: getBadgeTooltipForPreviousPeriod(
                                cleanStatsFilters
                            ),
                        }}
                        metricFormat={metricFormat}
                    />
                }
            >
                {drillDownMetric ? (
                    <DrillDownModalTrigger
                        enabled={!!trend.data?.value}
                        metricData={{
                            title,
                            metricName: drillDownMetric,
                        }}
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
