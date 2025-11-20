import { memo } from 'react'

import { TREND_BADGE_FORMAT } from '../../constants'
import type {
    MetricTrend,
    MetricTrendFormat,
    TooltipData,
    TrendColor,
    TwoDimensionalDataItem,
} from '../../types'
import {
    formatMetricTrend,
    formatMetricValue,
    getTrendColorFromValue,
} from '../../utils/helpers'
import { MetricCard } from '../MetricCard/MetricCard'
import { MetricCardHeader } from '../MetricCardHeader/MetricCardHeader'
import { TrendBadge } from '../TrendBadge/TrendBadge'
import { TrendChart } from '../TrendChart/TrendChart'

import css from './TrendCard.less'

export type TrendCardProps = {
    currency?: string
    hint?: TooltipData
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    isLoading?: boolean
    metricFormat?: MetricTrendFormat
    timeSeriesData?: TwoDimensionalDataItem[]
    trend: MetricTrend
    trendColor?: TrendColor
    withBorder?: boolean
    withFixedWidth?: boolean
}

export const TrendCard = memo<TrendCardProps>(
    ({
        currency,
        hint,
        interpretAs,
        isLoading = false,
        metricFormat,
        timeSeriesData,
        trend,
        trendColor,
        withBorder,
        withFixedWidth,
    }) => {
        const { data } = trend

        const { sign } = formatMetricTrend(
            data?.value,
            data?.prevValue,
            TREND_BADGE_FORMAT,
        )

        return (
            <MetricCard
                isLoading={isLoading}
                withBorder={withBorder}
                withFixedWidth={withFixedWidth}
            >
                <MetricCardHeader title={data?.label} hint={hint} />
                <div className={css.dataContent}>
                    <div className={css.trendData}>
                        <span className={css.metricData}>
                            {formatMetricValue(
                                data?.value,
                                metricFormat,
                                currency,
                            )}
                        </span>
                        <TrendBadge
                            value={data?.value}
                            prevValue={data?.prevValue}
                            metricFormat={metricFormat}
                            interpretAs={interpretAs}
                            currency={currency}
                        />
                    </div>
                    {!!timeSeriesData?.length && (
                        <TrendChart
                            trendColor={
                                trendColor ??
                                getTrendColorFromValue(sign, interpretAs)
                            }
                            data={timeSeriesData}
                            areaChartProps={{ width: 80, height: 30 }}
                        />
                    )}
                </div>
            </MetricCard>
        )
    },
)
