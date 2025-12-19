import { useMemo, useState } from 'react'

import { ChartCard, TimeSeriesChart } from '@repo/reporting'
import type { TimeSeriesDataItem } from '@repo/reporting'
import moment from 'moment'

import type { MetricTrendWithCurrency } from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem as DomainTimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import {
    formatCurrency,
    formatTimeSeriesData,
} from 'domains/reporting/pages/common/utils'
import { renderTickLabelAsNumber } from 'domains/reporting/pages/utils'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

type MetricOption = {
    id: string
    label: string
}

const METRIC_OPTIONS: MetricOption[] = [
    { id: 'total-sales', label: 'Total sales' },
]

type ShoppingAssistantLineChartProps = {
    gmvTrend: MetricTrendWithCurrency
    gmvTimeSeries: {
        data: DomainTimeSeriesDataItem[][]
        isError: boolean
        isFetching: boolean
    }
    granularity: ReportingGranularity
    filters: StatsFilters
}

export const ShoppingAssistantLineChart = ({
    gmvTrend,
    gmvTimeSeries,
    granularity,
    filters,
}: ShoppingAssistantLineChartProps) => {
    const [selectedMetric, setSelectedMetric] = useState<MetricOption>(
        METRIC_OPTIONS[0],
    )
    const { currency: fallbackCurrency } = useCurrency()

    const currency = useMemo(() => {
        return (
            gmvTrend?.data?.currency ||
            (gmvTimeSeries.data?.[0]?.[0]?.rawData as any)?.[
                AiSalesAgentOrdersDimension.Currency
            ] ||
            fallbackCurrency
        )
    }, [gmvTrend?.data?.currency, gmvTimeSeries.data, fallbackCurrency])

    const tooltipPeriod = formatPreviousPeriod(filters?.period)

    const value =
        gmvTrend?.data?.value !== null && gmvTrend?.data?.value !== undefined
            ? gmvTrend.data.value
            : undefined
    const prevValue =
        gmvTrend?.data?.prevValue !== null &&
        gmvTrend?.data?.prevValue !== undefined
            ? gmvTrend.data.prevValue
            : undefined

    const chartData = useMemo((): TimeSeriesDataItem[] => {
        if (!gmvTimeSeries.data || gmvTimeSeries.data.length === 0) return []

        const formattedData = formatTimeSeriesData(
            gmvTimeSeries.data,
            'Total sales',
            granularity,
        )

        const values = formattedData[0]?.values || []
        return values.map((item) => ({
            date: item.x,
            value: item.y,
        }))
    }, [gmvTimeSeries.data, granularity])

    const formatYAxisTick = (value: number) => {
        return renderTickLabelAsNumber(
            formatCurrency(value, currency, {
                notation: 'compact',
                compactDisplay: 'short',
            }),
        )
    }

    const formatTooltipValue = (value: number): string => {
        const formatted = formatCurrency(value, currency, {
            notation: 'standard',
        })
        return typeof formatted === 'number' ? formatted.toString() : formatted
    }

    const formatTooltipDate = (date: string): string => {
        return moment(date, 'MMM Do, YYYY').format('MMM D')
    }

    const isLoading = gmvTrend.isFetching || gmvTimeSeries.isFetching

    return (
        <ChartCard
            title={selectedMetric.label}
            value={value}
            prevValue={prevValue}
            metricFormat="currency-precision-1"
            currency={currency}
            interpretAs="more-is-better"
            tooltipData={{ period: tooltipPeriod }}
            isLoading={isLoading}
            metrics={METRIC_OPTIONS}
            onMetricChange={(metricId) => {
                const metric = METRIC_OPTIONS.find((m) => m.id === metricId)
                if (metric) {
                    setSelectedMetric(metric)
                }
            }}
        >
            <TimeSeriesChart
                data={chartData}
                isLoading={isLoading}
                color="#A084E1"
                yAxisFormatter={formatYAxisTick}
                valueFormatter={formatTooltipValue}
                dateFormatter={formatTooltipDate}
                useGradient={true}
                chartHeight={280}
            />
        </ChartCard>
    )
}
