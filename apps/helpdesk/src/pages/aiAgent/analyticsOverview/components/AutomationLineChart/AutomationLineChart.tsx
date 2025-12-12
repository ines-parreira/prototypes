import { useMemo } from 'react'

import { ChartCard } from '@repo/reporting'
import moment from 'moment'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts/types/component/Tooltip'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { seriesToTwoDimensionalDataItem } from 'domains/reporting/hooks/useTimeSeries'

import { DATE_FORMAT } from '../../constants'
import { formatPreviousPeriod } from '../../utils/formatPreviousPeriod'

import css from './AutomationLineChart.less'

const METRIC_TITLE = 'Overall automation rate'

const CHART_COLORS = {
    stroke: '#7E55F6',
    grid: '#B3B8C1',
}

export const CustomTooltip = ({
    active,
    payload,
    label,
}: TooltipContentProps<number | string, string | number>) => {
    if (!active || !payload || !payload[0]) {
        return null
    }

    const value = payload[0].value
    const percentage =
        typeof value === 'number' ? (value * 100).toFixed(1) : '0.0'
    const displayLabel = typeof label === 'number' ? label.toString() : label

    return (
        <div
            style={{
                backgroundColor: 'var(--surface-inverted-default)',
                borderRadius: 'var(--spacing-xs)',
                padding: 'var(--spacing-xxs) var(--spacing-xs)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'var(--spacing-xxxs)',
            }}
        >
            <p
                style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--surface-neutral-tertiary)',
                }}
            >
                {displayLabel}
            </p>
            <p
                style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'var(--content-inverted-default)',
                }}
            >
                {percentage}%
            </p>
        </div>
    )
}

export const formatYAxisTick = (value: number) => {
    const percentage = value * 100
    if (percentage >= 1000) {
        return `${(percentage / 1000).toFixed(percentage % 1000 === 0 ? 0 : 1)}K`
    }
    return percentage.toString()
}

export const AutomationLineChart = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data: timeSeriesData } = useAutomationRateTimeSeriesData(
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

    const chartData = useMemo(() => {
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

    return (
        <ChartCard
            title={METRIC_TITLE}
            value={value}
            prevValue={prevValue}
            metricFormat="decimal-to-percent"
            interpretAs="more-is-better"
            tooltipData={{ period: tooltipPeriod }}
        >
            <div className={css.chartWrapper}>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="automationRateGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={CHART_COLORS.stroke}
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="50%"
                                    stopColor={CHART_COLORS.stroke}
                                    stopOpacity={0.1}
                                />
                                <stop
                                    offset="75%"
                                    stopColor={CHART_COLORS.stroke}
                                    stopOpacity={0.05}
                                />
                                <stop
                                    offset="100%"
                                    stopColor={CHART_COLORS.stroke}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={CHART_COLORS.grid}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#5C6370', fontSize: 12 }}
                            axisLine={false}
                            tickLine={{ stroke: CHART_COLORS.grid }}
                            tickMargin={8}
                        />
                        <YAxis
                            tick={{ fill: '#5C6370', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatYAxisTick}
                            width={40}
                        />
                        <Tooltip content={CustomTooltip} cursor={false} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={CHART_COLORS.stroke}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#automationRateGradient)"
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </ChartCard>
    )
}
