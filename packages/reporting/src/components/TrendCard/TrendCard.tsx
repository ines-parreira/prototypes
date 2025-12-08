import type { ReactNode } from 'react'
import { memo, useState } from 'react'

import { Box, Skeleton, Text } from '@gorgias/axiom'

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
    actionMenu?: ReactNode
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
        actionMenu,
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
        const [isHovered, setIsHovered] = useState(false)

        const { sign } = formatMetricTrend(
            data?.value,
            data?.prevValue,
            TREND_BADGE_FORMAT,
        )

        return (
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <MetricCard
                    withBorder={withBorder}
                    withFixedWidth={withFixedWidth}
                >
                    <MetricCardHeader
                        title={data?.label}
                        hint={hint}
                        actionMenu={isHovered ? actionMenu : undefined}
                    />

                    <div className={css.dataContent}>
                        <div className={css.trendData}>
                            <span className={css.metricData}>
                                {isLoading ? (
                                    <Skeleton
                                        height={36}
                                        width={
                                            metricFormat === 'duration'
                                                ? 64
                                                : 52
                                        }
                                    />
                                ) : (
                                    formatMetricValue(
                                        data?.value,
                                        metricFormat,
                                        currency,
                                    )
                                )}
                            </span>
                            {isLoading ? (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    height="14px"
                                >
                                    <Skeleton
                                        height={14}
                                        width={14}
                                        style={{ marginTop: '5px' }}
                                    />
                                    <Text size="xs">%</Text>
                                </Box>
                            ) : (
                                <TrendBadge
                                    value={data?.value}
                                    prevValue={data?.prevValue}
                                    metricFormat={metricFormat}
                                    interpretAs={interpretAs}
                                    currency={currency}
                                />
                            )}
                        </div>
                    </div>
                    {!isLoading && !!timeSeriesData?.length && (
                        <TrendChart
                            isStrokeSolid
                            trendColor={
                                trendColor ??
                                getTrendColorFromValue(sign, interpretAs)
                            }
                            data={timeSeriesData}
                            areaChartProps={{ width: '100%', height: 25 }}
                        />
                    )}
                </MetricCard>
            </div>
        )
    },
)
