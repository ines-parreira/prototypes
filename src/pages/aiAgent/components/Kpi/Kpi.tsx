import React, { useMemo } from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { StatType } from 'models/stat/types'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatCurrency,
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'

import css from './Kpi.less'

type Props = {
    title?: string
    isLoading?: boolean
    value?: number
    prevValue?: number
    metricType?: StatType.Number | StatType.Currency
    metricFormat?: MetricTrendFormat
    currency?: string
    hint?: string
}

export const Kpi = ({
    title,
    value,
    prevValue,
    metricType,
    metricFormat,
    currency,
    hint,
    isLoading,
}: Props) => {
    const formattedValue = useMemo(() => {
        if (value === undefined) {
            return NOT_AVAILABLE_PLACEHOLDER
        }

        switch (metricType) {
            case StatType.Number:
                return formatMetricValue(value, metricFormat)
            case StatType.Currency:
                return formatCurrency(value, currency ?? 'USD')
        }
    }, [metricType, metricFormat, value, currency])

    const cardTitle = useMemo(() => {
        if (title === undefined) {
            return <Skeleton width={150} />
        }

        return <div>{title}</div>
    }, [title])

    return (
        <>
            <MetricCard
                {...{
                    isLoading,
                    className: css.card,
                    hint: hint ? { title: hint } : undefined,
                    title: cardTitle,
                }}
            >
                <BigNumberMetric
                    isLoading={isLoading}
                    className={css.metric}
                    trendBadge={
                        <TrendBadge
                            value={value}
                            prevValue={prevValue}
                            metricFormat="percent"
                            interpretAs="more-is-better"
                        />
                    }
                >
                    {formattedValue}
                </BigNumberMetric>
            </MetricCard>
        </>
    )
}
