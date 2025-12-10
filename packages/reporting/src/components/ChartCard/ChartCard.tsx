import type { ReactNode } from 'react'

import { Card } from '@gorgias/axiom'

import { ChartHeader } from './components/ChartHeader'
import type { MetricTrendFormat, TrendDirection } from './types'

import css from './ChartCard.less'

type MetricOption = {
    id: string
    label: string
}

type ChartCardProps = {
    children: ReactNode
    chartControls?: ReactNode
    currency?: string
    interpretAs?: TrendDirection
    metrics?: MetricOption[]
    metricFormat?: MetricTrendFormat
    onMetricChange?: (metric: string) => void
    title: string
    value?: number
    prevValue?: number
    tooltipData?: {
        period: string
    }
}

export const ChartCard = ({
    children,
    chartControls,
    currency,
    interpretAs = 'neutral',
    metrics,
    metricFormat,
    onMetricChange,
    title,
    value,
    prevValue,
    tooltipData,
}: ChartCardProps) => {
    return (
        <Card flex={1} p="lg" className={css.cardContainer}>
            <ChartHeader
                title={title}
                value={value}
                prevValue={prevValue}
                metrics={metrics}
                metricFormat={metricFormat}
                currency={currency}
                interpretAs={interpretAs}
                onMetricChange={onMetricChange}
                chartControls={chartControls}
                tooltipData={tooltipData}
            />
            {children}
        </Card>
    )
}
