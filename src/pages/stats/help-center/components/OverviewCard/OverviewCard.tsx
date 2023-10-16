import React, {ReactNode} from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {formatReportingQueryDate} from 'utils/reporting'
import MetricCard from '../../../MetricCard'
import TrendBadge from '../../../TrendBadge'
import {formatMetricValue} from '../../../common/utils'
import PerformanceTip from '../../../PerformanceTip'
import BigNumberMetric from '../../../BigNumberMetric'
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
                        tooltip={`Compared to: ${periodStart} - ${periodEnd}`}
                    />
                )
            }
            tip={
                showTip ? (
                    <PerformanceTip showBenchmark={false}>
                        {tipContent}
                    </PerformanceTip>
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
