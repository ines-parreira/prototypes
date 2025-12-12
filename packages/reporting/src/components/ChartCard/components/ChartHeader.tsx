import type { ReactNode } from 'react'

import { Box, Heading, Text } from '@gorgias/axiom'

import { formatMetricValueOrString } from '../../../utils/helpers'
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
    value?: number
    prevValue?: number
    metrics?: MetricOption[]
    metricFormat?: MetricTrendFormat
    currency?: string
    interpretAs?: TrendDirection
    onMetricChange?: (metric: string) => void
    chartControls?: ReactNode
    tooltipData?: {
        period: string
    }
}

export const ChartHeader = ({
    title,
    value,
    prevValue,
    metrics,
    metricFormat,
    currency,
    interpretAs = 'neutral',
    onMetricChange,
    chartControls,
    tooltipData,
}: ChartHeaderProps) => {
    const showMetricsDropdown = metrics && metrics.length > 1 && onMetricChange

    const formatValue = formatMetricValueOrString({ metricFormat, currency })
    const formattedValue = value !== undefined ? formatValue(value) : undefined

    return (
        <Box flexDirection="column" gap="xxxs" className={css.header}>
            <Box
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                height="24px"
            >
                <Box alignItems="center" gap="xxxs">
                    {showMetricsDropdown ? (
                        <ChartMetricSelect
                            metrics={metrics}
                            selectedMetric={title}
                            onMetricChange={onMetricChange}
                        />
                    ) : (
                        <Text size="md" variant="bold">
                            {title}
                        </Text>
                    )}
                </Box>
                {chartControls && (
                    <Box display="flex" gap="xxxs">
                        {chartControls}
                    </Box>
                )}
            </Box>
            {formattedValue !== undefined && (
                <Box alignItems="center" gap="xxxs">
                    <Heading size="xl" className={css.value}>
                        {formattedValue}
                    </Heading>
                    {prevValue !== undefined && (
                        <TrendBadge
                            value={value}
                            prevValue={prevValue}
                            metricFormat={metricFormat}
                            currency={currency}
                            interpretAs={interpretAs}
                            tooltipData={tooltipData}
                            size="md"
                        />
                    )}
                </Box>
            )}
        </Box>
    )
}
