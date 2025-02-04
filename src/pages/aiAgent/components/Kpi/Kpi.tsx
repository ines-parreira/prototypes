import React, {useMemo} from 'react'

import {StatType} from 'models/stat/types'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatCurrency,
    formatNumber,
    formatPercent,
} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'

import css from './Kpi.less'

type Props = {
    title: string
    isLoading?: boolean
    value?: number
    prevValue?: number
    metricType?: StatType.Number | StatType.Percent | StatType.Currency
    currency?: string
    hint?: string
}

export const Kpi = ({
    title,
    value,
    prevValue,
    metricType,
    currency,
    hint,
    isLoading,
}: Props) => {
    const formattedValue = useMemo(() => {
        if (value === undefined) {
            return ''
        }

        switch (metricType) {
            case StatType.Number:
                return formatNumber(value)
            case StatType.Currency:
                return formatCurrency(value, currency ?? 'USD')
            case StatType.Percent:
                return formatPercent(value)
        }
    }, [metricType, value, currency])

    return (
        <>
            <MetricCard
                {...{
                    isLoading,
                    className: css.card,
                    hint: hint ? {title: hint} : undefined,
                    title,
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
