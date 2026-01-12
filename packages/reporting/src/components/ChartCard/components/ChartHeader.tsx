import type { ReactNode } from 'react'

import { Box, Heading, Skeleton, Text } from '@gorgias/axiom'

import { NOT_AVAILABLE_PLACEHOLDER } from '../../../constants'
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
    isLoading?: boolean
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
    isLoading,
}: ChartHeaderProps) => {
    const showMetricsDropdown = metrics && metrics.length > 1 && onMetricChange

    const formatValue = formatMetricValueOrString({ metricFormat, currency })
    const formattedValue =
        value !== undefined ? formatValue(value) : NOT_AVAILABLE_PLACEHOLDER

    const hasData = !isLoading && !!value

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
                {hasData && chartControls && (
                    <Box display="flex" gap="xxxs">
                        {chartControls}
                    </Box>
                )}
            </Box>
            {isLoading ? (
                <Box display="flex" alignItems="center" gap="xxxs">
                    <Skeleton height={36} width={52} />
                    <Box display="flex" alignItems="center">
                        <Skeleton
                            height={14}
                            width={14}
                            style={{ marginTop: '5px' }}
                        />
                    </Box>
                </Box>
            ) : (
                <Box alignItems="center" gap="xxxs">
                    <Heading size="xl" className={css.value}>
                        {formattedValue}
                    </Heading>
                    {hasData && (
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
