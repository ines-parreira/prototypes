import { useMemo } from 'react'

import { ChartCard, formatMetricValue, TimeSeriesChart } from '@repo/reporting'
import type { TimeSeriesDataItem } from '@repo/reporting'
import moment from 'moment'

import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import { useAiAgentSupportInteractionsTimeSeriesData } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import { useAiAgentSupportInteractionsTrend } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { NUMBER_TICK_FORMATTER } from 'domains/reporting/pages/utils'
import { DATE_FORMAT } from 'pages/aiAgent/analyticsOverview/constants'
import { formatPreviousPeriod } from 'pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod'

const METRIC_TITLE = 'Support interactions'

const CHART_COLOR = colors['Dataviz-purple'].$value

const formatYAxisTick = (value: number) => {
    return NUMBER_TICK_FORMATTER.format(value)
}

const formatTooltipValue = (value: number) => {
    return formatMetricValue(value, 'integer')
}

export const AnalyticsSupportAgentLineChart = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data: timeSeriesData } =
        useAiAgentSupportInteractionsTimeSeriesData(
            cleanStatsFilters,
            userTimezone,
            granularity,
        )

    const supportInteractionsTrend = useAiAgentSupportInteractionsTrend(
        cleanStatsFilters,
        userTimezone,
    )

    const tooltipPeriod = formatPreviousPeriod(cleanStatsFilters?.period)

    const value =
        supportInteractionsTrend.data?.value !== null &&
        supportInteractionsTrend.data?.value !== undefined
            ? supportInteractionsTrend.data.value
            : undefined

    const prevValue =
        supportInteractionsTrend.data?.prevValue !== null &&
        supportInteractionsTrend.data?.prevValue !== undefined
            ? supportInteractionsTrend.data.prevValue
            : undefined

    const chartData = useMemo((): TimeSeriesDataItem[] => {
        if (!timeSeriesData || !timeSeriesData[0]) {
            return []
        }

        const series = seriesToTwoDimensionalDataItem(timeSeriesData[0], {
            label: METRIC_TITLE,
            dateFormatter: (date) =>
                moment(date).format(DATE_FORMAT).replace(', ', ' '),
        })

        if (!series[0]) return []

        return series[0].values.map((point) => ({
            date: point.x,
            value: point.y,
        }))
    }, [timeSeriesData])

    const isLoading = supportInteractionsTrend.isFetching || !timeSeriesData

    return (
        <ChartCard
            title={METRIC_TITLE}
            value={value}
            prevValue={prevValue}
            metricFormat="decimal"
            interpretAs="more-is-better"
            tooltipData={{ period: tooltipPeriod }}
            isLoading={isLoading}
        >
            <TimeSeriesChart
                data={chartData}
                isLoading={isLoading}
                color={CHART_COLOR}
                yAxisFormatter={formatYAxisTick}
                valueFormatter={formatTooltipValue}
                useGradient={true}
                chartHeight={280}
            />
        </ChartCard>
    )
}
