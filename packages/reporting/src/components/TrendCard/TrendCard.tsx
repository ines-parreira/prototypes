import { memo } from 'react'

import { TREND_BADGE_FORMAT } from '../../constants'
import {
    MetricTrend,
    MetricTrendFormat,
    TooltipData,
    TwoDimensionalDataItem,
} from '../../types'
import { formatMetricTrend, getTrendColorFromValue } from '../../utils/helpers'
import { MetricCard } from '../MetricCard/MetricCard'
import { MetricCardHeader } from '../MetricCardHeader/MetricCardHeader'
import { TrendBadge } from '../TrendBadge/TrendBadge'
import { TrendChart } from '../TrendChart/TrendChart'

import css from './TrendCard.less'

export type TrendCardProps = {
    hint?: TooltipData
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    isLoading?: boolean
    metricFormat?: MetricTrendFormat
    timeSeriesData: TwoDimensionalDataItem[]
    trend: MetricTrend
}

export const TrendCard = memo<TrendCardProps>(
    ({
        hint,
        interpretAs,
        isLoading = false,
        metricFormat,
        timeSeriesData,
        trend,
    }) => {
        const { data } = trend

        const { sign } = formatMetricTrend(
            data?.value,
            data?.prevValue,
            TREND_BADGE_FORMAT,
        )

        const trendColor = getTrendColorFromValue(sign, interpretAs)

        return (
            <MetricCard isLoading={isLoading}>
                <MetricCardHeader title={data?.label} hint={hint} />
                <div className={css.dataContent}>
                    <div className={css.trendData}>
                        <span className={css.metricData}>{data?.value}</span>
                        <TrendBadge
                            value={data?.value}
                            prevValue={data?.prevValue}
                            metricFormat={metricFormat}
                            interpretAs={interpretAs}
                        />
                    </div>
                    {timeSeriesData && (
                        <TrendChart
                            trendColor={trendColor}
                            data={timeSeriesData}
                            areaChartProps={{ width: 80, height: 30 }}
                        />
                    )}
                </div>
            </MetricCard>
        )
    },
)
