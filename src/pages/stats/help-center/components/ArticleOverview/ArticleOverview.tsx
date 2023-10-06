import React from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import MetricCard from '../../../MetricCard'
import TrendBadge from '../../../TrendBadge'
import {DEFAULT_LOCALE} from '../../../common/utils'
import PerformanceTip from '../../../PerformanceTip'
import BigNumberMetric from '../../../BigNumberMetric'
import css from './ArticleOverview.less'

const formatNumber = (value: number) =>
    new Intl.NumberFormat(DEFAULT_LOCALE, {
        maximumFractionDigits: 2,
    }).format(value)

export type ArticleOverviewProps = {
    trendValue?: number
    prevTrendValue?: number
    showTip: boolean
    isLoading: boolean
}

const ArticleOverview = ({
    trendValue,
    prevTrendValue,
    showTip,
    isLoading,
}: ArticleOverviewProps) => {
    const hintTitle =
        'Total number of article views, including duplicate views by the same user'

    return (
        <MetricCard
            isLoading={isLoading}
            title="Article views"
            hint={{
                title: hintTitle,
            }}
            trendBadge={
                isLoading ? (
                    <Skeleton height={20} className={css.trendLoader} />
                ) : (
                    <TrendBadge
                        prevValue={prevTrendValue}
                        value={trendValue}
                        format="percent"
                        interpretAs="more-is-better"
                    />
                )
            }
            tip={
                showTip ? (
                    <PerformanceTip showBenchmark={false}>
                        Check out our{' '}
                        <a
                            href="https://docs.gorgias.com/en-US"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Help Docs
                        </a>{' '}
                        to learn about strategies you can use to increase
                        article views for your Help Center.
                    </PerformanceTip>
                ) : null
            }
        >
            {isLoading ? (
                <Skeleton height={32} inline />
            ) : trendValue !== undefined && prevTrendValue !== undefined ? (
                <BigNumberMetric from={formatNumber(prevTrendValue)}>
                    <span className={css.bigNumber}>
                        {formatNumber(trendValue)}
                    </span>
                </BigNumberMetric>
            ) : null}
        </MetricCard>
    )
}

export default ArticleOverview
