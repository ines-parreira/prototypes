import React, {ReactNode} from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {formatMetricValue} from 'pages/stats/common/utils'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import MetricCard from 'pages/stats/MetricCard'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import PerformanceTip from 'pages/stats/PerformanceTip'
import {getBadgeTooltipForPreviousPeriod} from 'pages/stats/utils'

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
} & DashboardChartProps

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
    chartId,
    dashboard,
}: OverviewCardProps) => {
    return (
        <MetricCard
            chartId={chartId}
            dashboard={dashboard}
            isLoading={isLoading}
            title={title}
            hint={{
                title: hintTitle,
            }}
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
                <BigNumberMetric
                    trendBadge={
                        <TrendBadge
                            prevValue={prevTrendValue}
                            value={trendValue}
                            interpretAs="more-is-better"
                            tooltipData={{
                                period: getBadgeTooltipForPreviousPeriod({
                                    start_datetime: startDate,
                                    end_datetime: endDate,
                                }),
                            }}
                        />
                    }
                >
                    <span className={css.bigNumber}>
                        {formatMetricValue(trendValue)}
                    </span>
                </BigNumberMetric>
            )}
        </MetricCard>
    )
}

export default OverviewCard
