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

    const {formattedTrend, sign = 0} = useMemo(() => {
        return value != null && prevValue != null
            ? formatMetricTrend(value, prevValue, trendFormat)
            : {formattedTrend: notAvailableText}
    }, [trendFormat, value, prevValue, notAvailableText])

    let trendColor: ComponentProps<typeof TrendBadge>['color'] = 'neutral'
    if (interpretAs === 'more-is-better') {
        trendColor = sign > 0 ? 'positive' : sign < 0 ? 'negative' : 'neutral'
    } else if (interpretAs === 'less-is-better') {
        trendColor = sign > 0 ? 'negative' : sign < 0 ? 'positive' : 'neutral'
    }

    return (
        <MetricCard
            title={title}
            hint={hint}
            tooltip={tooltip}
            trendBadge={
                !data ? (
                    <Skeleton height={18} width={50} />
                ) : value != null && prevValue != null && formattedTrend ? (
                    <TrendBadge color={trendColor}>{`${
                        sign > 0 ? '+' : sign < 0 ? '-' : ''
                    }${formattedTrend}`}</TrendBadge>
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
