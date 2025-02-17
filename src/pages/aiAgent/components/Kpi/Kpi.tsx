import {Skeleton} from '@gorgias/merchant-ui-kit'
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
    title?: string
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

        const fixedValue = +value.toFixed(2)

        switch (metricType) {
            case StatType.Number:
                return formatNumber(fixedValue)
            case StatType.Currency:
                return formatCurrency(fixedValue, currency ?? 'USD')
            case StatType.Percent:
                return formatPercent(fixedValue)
        }
    }, [metricType, value, currency])

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
                    hint: hint ? {title: hint} : undefined,
                    title: cardTitle,
                }}
            >
                <BigNumberMetric
                    isLoading={isLoading}
                    className={css.metric}
                    trendBadge={
                        prevValue !== undefined ? (
                            <TrendBadge
                                value={value}
                                prevValue={prevValue}
                                metricFormat="percent"
                                interpretAs="more-is-better"
                            />
                        ) : undefined
                    }
                >
                    {formattedValue}
                </BigNumberMetric>
            </MetricCard>
        </>
    )
}
