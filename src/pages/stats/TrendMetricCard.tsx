import React, {ComponentProps, ReactNode, useMemo} from 'react'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
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
    data?: MetricTrend['data']
    tooltip?: ReactNode
    valueFormat?: MetricValueFormat
    trendFormat?: MetricTrendFormat
    interpretAs?: 'more-is-better' | 'less-is-better' | 'neutral'
    notAvailableText?: string
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
    notAvailableText = 'N/A',
    children,
}: Props) {
    const {prevValue, value} = data || {}
    const diff =
        data?.prevValue != null && data?.value != null
            ? data.value - data.prevValue
            : 0

    const formattedValue = useMemo(() => {
        return value != null
            ? formatMetricValue(value, valueFormat)
            : notAvailableText
    }, [valueFormat, value, notAvailableText])

    const formattedPrevValue = useMemo(() => {
        return prevValue != null
            ? formatMetricValue(prevValue, valueFormat)
            : notAvailableText
    }, [valueFormat, prevValue, notAvailableText])

    const formattedTrend = useMemo(() => {
        return value != null && prevValue != null
            ? formatMetricTrend(value, prevValue, trendFormat)
            : notAvailableText
    }, [trendFormat, value, prevValue, notAvailableText])

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
                !data ? (
                    <Skeleton height={18} width={50} />
                ) : data.value != null && data.prevValue != null ? (
                    <TrendBadge
                        color={trendColor}
                        direction={diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'}
                    >
                        {formattedTrend}
                    </TrendBadge>
                ) : null
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
