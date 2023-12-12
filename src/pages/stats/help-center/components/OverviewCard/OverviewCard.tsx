import React, {ReactNode} from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {formatReportingQueryDate} from 'utils/reporting'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import MetricCard from 'pages/stats/MetricCard'
import TrendBadge from 'pages/stats/TrendBadge'
import {formatMetricValue} from 'pages/stats/common/utils'
import PerformanceTip from 'pages/stats/PerformanceTip'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'
import {DateAndTimeFormatting} from 'constants/datetime'
import {formatDatetime} from 'utils'
import css from './OverviewCard.less'

export type OverviewCardProps = {
    trendValue?: number | null
    prevTrendValue?: number | null
    showTip: boolean
    isLoading: boolean
    hintTitle: string
    startDate: string
    endDate: string
    title: string
    tipContent: ReactNode
}

const OverviewCard = ({
    trendValue,
    prevTrendValue,
    showTip,
    isLoading,
    hintTitle,
    title,
    tipContent,
    startDate,
    endDate,
}: OverviewCardProps) => {
    const periodStart = formatReportingQueryDate(startDate)
    const periodEnd = formatReportingQueryDate(endDate)
    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.LongDateWithYear
    )
    const formattedStartDate = formatDatetime(
        periodStart,
        datetimeFormat
    ).toString()
    const formattedEndDate = formatDatetime(
        periodEnd,
        datetimeFormat
    ).toString()

    return (
        <MetricCard
            isLoading={isLoading}
            title={title}
            hint={{
                title: hintTitle,
            }}
            trendBadge={
                isLoading ? (
                    <Skeleton
                        data-testid="trend-badge-loader"
                        height={20}
                        className={css.trendLoader}
                    />
                ) : (
                    <TrendBadge
                        prevValue={prevTrendValue}
                        value={trendValue}
                        format="percent"
                        interpretAs="more-is-better"
                        tooltip={`Compared to: ${formattedStartDate} - ${formattedEndDate}`}
                    />
                )
            }
            tip={
                showTip ? (
                    !isLoading && !prevTrendValue && !trendValue ? (
                        <NoDataAvailable
                            title="No data"
                            description="No data available for the selected filters."
                            className={css.noDataContainer}
                        />
                    ) : (
                        <PerformanceTip showBenchmark={false}>
                            {tipContent}
                        </PerformanceTip>
                    )
                ) : null
            }
        >
            {isLoading ? (
                <Skeleton data-testid="content-loader" height={32} inline />
            ) : (
                <BigNumberMetric from={formatMetricValue(prevTrendValue)}>
                    <span className={css.bigNumber}>
                        {formatMetricValue(trendValue)}
                    </span>
                </BigNumberMetric>
            )}
        </MetricCard>
    )
}

export default OverviewCard
