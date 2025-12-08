import type { ReactNode } from 'react'

import { Box, Heading } from '@gorgias/axiom'

import { TrendBadge } from '../../TrendBadge/TrendBadge'
import type { MetricTrendFormat, TrendDirection } from '../types'
import { ChartMetricSelect } from './ChartMetricSelect'

import css from '../ChartCard.less'

type MetricOption = {
    id: string
    label: string
}

type ChartHeaderProps = {
    title: string
    value?: string | number
    trend?: number
    prevValue?: number
    metrics?: MetricOption[]
    metricFormat?: MetricTrendFormat
    currency?: string
    interpretAs?: TrendDirection
    onMetricChange?: (metric: string) => void
    chartControls?: ReactNode
}

export const ChartHeader = ({
    title,
    value,
    trend,
    prevValue,
    metrics,
    metricFormat,
    currency,
    interpretAs = 'neutral',
    onMetricChange,
    chartControls,
}: ChartHeaderProps) => {
    const showMetricsDropdown = metrics && metrics.length > 1 && onMetricChange

    return (
        <Box flexDirection="column" gap="xxxs" className={css.header}>
            <Box
                alignItems="center"
                justifyContent="space-between"
                width="100%"
            >
                <Box alignItems="center" gap="xxxs">
                    {showMetricsDropdown ? (
                        <ChartMetricSelect
                            metrics={metrics}
                            selectedMetric={title}
                            onMetricChange={onMetricChange}
                        />
                    ) : (
                        <Heading size="md">{title}</Heading>
                    )}
                </Box>
                {chartControls && (
                    <Box display="flex" gap="xxxs">
                        {chartControls}
                    </Box>
                )}
            </Box>
            {value !== undefined && (
                <Box alignItems="center" gap="xxxs">
                    <Heading size="xl" className={css.value}>
                        {value}
                    </Heading>
                    {trend !== undefined && (
                        <TrendBadge
                            value={trend}
                            prevValue={prevValue ?? 0}
                            metricFormat={metricFormat}
                            currency={currency}
                            interpretAs={interpretAs}
                            size="md"
                        />
                    )}
                </Box>
            )}
        </Box>
    )
}
