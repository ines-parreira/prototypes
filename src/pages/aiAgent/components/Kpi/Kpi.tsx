import React, { useMemo } from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'
import { TooltipData } from 'pages/stats/types'

import css from './Kpi.less'

type Props = {
    title?: string
    isLoading?: boolean
    value?: number
    prevValue?: number
    metricFormat?: MetricTrendFormat
    currency?: string
    hint?: TooltipData
    'data-candu-id'?: string
}

export const Kpi = ({
    title,
    value,
    prevValue,
    metricFormat,
    currency,
    hint,
    isLoading,
    ...props
}: Props) => {
    const formattedValue = useMemo(() => {
        if (value === undefined) {
            return NOT_AVAILABLE_PLACEHOLDER
        }

        return formatMetricValue(value, metricFormat, undefined, currency)
    }, [metricFormat, value, currency])

    const cardTitle = useMemo(() => {
        if (title === undefined) {
            return <Skeleton width={150} />
        }

        return <div>{title}</div>
    }, [title])

    return (
        <MetricCard
            {...{
                isLoading,
                className: css.card,
                hint: hint,
                title: cardTitle,
            }}
            data-candu-id={props['data-candu-id']}
        >
            <BigNumberMetric
                isLoading={isLoading}
                className={css.metric}
                trendBadge={
                    <TrendBadge
                        value={value}
                        prevValue={prevValue}
                        metricFormat={metricFormat}
                        currency={currency}
                        interpretAs="more-is-better"
                    />
                }
            >
                {formattedValue}
            </BigNumberMetric>
        </MetricCard>
    )
}
