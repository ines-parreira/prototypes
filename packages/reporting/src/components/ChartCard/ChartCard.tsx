import type { ReactNode } from 'react'

import { Box, Card, Heading, Text } from '@gorgias/axiom'

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
    isLoading?: boolean
    alwaysShowChartControls?: boolean
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
    isLoading,
    alwaysShowChartControls = false,
}: ChartCardProps) => {
    const noData = !isLoading && !value

    return (
        <Card flex={1} p="lg" gap="xxl" className={css.cardContainer}>
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
                isLoading={isLoading}
                alwaysShowChartControls={alwaysShowChartControls}
            />
            {noData ? (
                <Box
                    height="274px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="xxl"
                    gap="xs"
                >
                    <Heading size="sm">No data found</Heading>
                    <Text size="md" color="secondary">
                        Try to adjust your report filters.
                    </Text>
                </Box>
            ) : (
                children
            )}
        </Card>
    )
}
