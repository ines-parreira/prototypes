import React, {ComponentProps, ReactNode, useMemo} from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {
    formatMetricValue,
    formatMetricTrend,
    MetricValueFormat,
    MetricTrendFormat,
} from 'pages/stats/common/utils'

import TrendBadge from './TrendBadge'
import MetricCard from './MetricCard'

type RenderValues = {
    formattedValue: string
    formattedPrevValue: string
}
type Props = {
    title: string
    hint: string
    data?: {
        value: number
        prevValue: number
    }
    tooltip?: ReactNode
    valueFormat?: MetricValueFormat
    trendFormat?: MetricTrendFormat
    interpretAs?: 'more-is-better' | 'less-is-better' | 'neutral'
    children: (values: RenderValues) => ReactNode
}

export default function TrendMetricCard({
    title,
    hint,
    tooltip,
    data,
    valueFormat = 'decimal',
    trendFormat = valueFormat,
    interpretAs = 'neutral',
    children,
}: Props) {
    const {prevValue, value} = data || {}
    const diff = data ? data.value - data.prevValue : 0

    const formattedValue = useMemo(() => {
        return value != null ? formatMetricValue(value, valueFormat) : ''
    }, [valueFormat, value])

    const formattedPrevValue = useMemo(() => {
        return prevValue != null
            ? formatMetricValue(prevValue, valueFormat)
            : ''
    }, [valueFormat, prevValue])

    const formattedTrend = useMemo(() => {
        return value != null && prevValue != null
            ? formatMetricTrend(value, prevValue, trendFormat)
            : ''
    }, [trendFormat, value, prevValue])

    let trendColor: ComponentProps<typeof TrendBadge>['color'] = 'neutral'
    if (interpretAs === 'more-is-better') {
        trendColor = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral'
    } else if (interpretAs === 'less-is-better') {
        trendColor = diff > 0 ? 'negative' : diff < 0 ? 'positive' : 'neutral'
    }

    return (
        <MetricCard
            title={title}
            hint={hint}
            tooltip={tooltip}
            trendBadge={
                data ? (
                    <TrendBadge
                        color={trendColor}
                        direction={diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'}
                    >
                        {formattedTrend}
                    </TrendBadge>
                ) : (
                    <Skeleton height={18} width={50} />
                )
            }
        >
            {!data ? (
                <Skeleton height={32} />
            ) : (
                children({
                    formattedValue,
                    formattedPrevValue,
                })
            )}
        </MetricCard>
    )
}
