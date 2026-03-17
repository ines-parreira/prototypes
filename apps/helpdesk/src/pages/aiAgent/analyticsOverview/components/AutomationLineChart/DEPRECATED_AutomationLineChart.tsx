import { useMemo } from 'react'

import { ChartCard, TimeSeriesChart } from '@repo/reporting'
import type { TimeSeriesDataItem } from '@repo/reporting'
import moment from 'moment'

import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { NUMBER_TICK_FORMATTER } from 'domains/reporting/pages/utils'

import { DATE_FORMAT } from '../../constants'
import { formatPreviousPeriod } from '../../utils/formatPreviousPeriod'

const METRIC_TITLE = 'Overall automation rate'

const CHART_COLOR = colors['Dataviz-purple'].$value

const formatYAxisTick = (value: number) => {
    const percentage = value * 100
    return NUMBER_TICK_FORMATTER.format(percentage)
}

const formatTooltipValue = (value: number) => {
    const percentage = (value * 100).toFixed(1)
    return `${percentage}%`
}

export const DEPRECATED_AutomationLineChart = () => {
    const { statsFilters, userTimezone, granularity } = useAutomateFilters()

    const { data: timeSeriesData } = useAutomationRateTimeSeriesData(
        statsFilters,
        userTimezone,
        granularity,
    )

    const automationRateTrend = useAutomationRateTrend(
        statsFilters,
        userTimezone,
    )

    const tooltipPeriod = formatPreviousPeriod(statsFilters?.period)

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
