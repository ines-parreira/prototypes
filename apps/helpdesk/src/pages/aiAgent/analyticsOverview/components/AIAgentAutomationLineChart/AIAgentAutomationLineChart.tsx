import { useMemo } from 'react'

import { ChartCard, TimeSeriesChart } from '@repo/reporting'
import type { TimeSeriesDataItem } from '@repo/reporting'
import moment from 'moment'

import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import { useAIAgentAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTimeSeriesData'
import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { NUMBER_TICK_FORMATTER } from 'domains/reporting/pages/utils'

import { DATE_FORMAT } from '../../constants'
import { formatPreviousPeriod } from '../../utils/formatPreviousPeriod'

const METRIC_TITLE = 'Automation rate'

const CHART_COLOR = colors['Dataviz-purple'].$value

const formatYAxisTick = (value: number) => {
    const percentage = value * 100
    return NUMBER_TICK_FORMATTER.format(percentage)
}

const formatTooltipValue = (value: number) => {
    const percentage = (value * 100).toFixed(1)
    return `${percentage}%`
}

export const AIAgentAutomationLineChart = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data: timeSeriesData } = useAIAgentAutomationRateTimeSeriesData(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    const automationRateTrend = useAIAgentAutomationRateTrend(
        cleanStatsFilters,
        userTimezone,
    )

    const tooltipPeriod = formatPreviousPeriod(cleanStatsFilters?.period)

    const value =
        automationRateTrend.data?.value !== null &&
        automationRateTrend.data?.value !== undefined
            ? automationRateTrend.data.value
            : undefined

    const prevValue =
        automationRateTrend.data?.prevValue !== null &&
        automationRateTrend.data?.prevValue !== undefined
            ? automationRateTrend.data.prevValue
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

    const isLoading = automationRateTrend.isFetching || !timeSeriesData

    return (
        <ChartCard
            title={METRIC_TITLE}
            value={value}
            prevValue={prevValue}
            metricFormat="decimal-to-percent"
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
