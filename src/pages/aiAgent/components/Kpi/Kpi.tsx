import React, { useMemo } from 'react'

import cn from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    formatMetricValue,
    MetricTrendFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
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
    action?: React.ReactNode
    hideTrend?: boolean
}

export const Kpi = ({
    title,
    value,
    prevValue,
    metricFormat,
    currency,
    hint,
    isLoading,
    action,
    hideTrend,
    'data-candu-id': canduId,
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

        return <div title={title}>{title}</div>
    }, [title])

    return (
        <MetricCard
            {...{
                isLoading,
                className: css.card,
                hint: hint,
                title: cardTitle,
            }}
            data-candu-id={canduId}
        >
            <div
                className={cn(css.wrapper, { [css.metricWrapper]: !isLoading })}
            >
                <BigNumberMetric
                    isLoading={isLoading}
                    className={css.metric}
                    trendBadge={
                        hideTrend ? undefined : (
                            <TrendBadge
                                value={value}
                                prevValue={prevValue}
                                metricFormat={metricFormat}
                                currency={currency}
                                interpretAs="more-is-better"
                            />
                        )
                    }
                >
                    {formattedValue}
                </BigNumberMetric>
                {action}
            </div>
        </MetricCard>
    )
}
