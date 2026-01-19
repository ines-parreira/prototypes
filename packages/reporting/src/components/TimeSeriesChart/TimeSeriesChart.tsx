import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { SizeValue } from '@gorgias/axiom'
import { Box } from '@gorgias/axiom'
import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import type { TimeSeriesDataItem } from '../ChartCard'
import { TimeSeriesChartSkeleton } from './TimeSeriesChartSkeleton'
import { TimeSeriesChartTooltip } from './TimeSeriesChartTooltip'

import css from './TimeSeriesChart.less'

type TimeSeriesChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: TimeSeriesDataItem[]
    isLoading?: boolean
    valueFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    dateFormatter?: (date: string) => string
    color?: string
    useGradient?: boolean
    chartHeight?: number
}

const DEFAULT_CHART_HEIGHT = 280
const DEFAULT_COLOR = colors['Dataviz-purple'].$value
const GRID_COLOR = 'var(--border-neutral-secondary)'
const TICK_COLOR = 'var(--content-neutral-tertiary)'

export const renderTimeSeriesTooltipContent =
    (
        valueFormatter?: (value: number) => string,
        dateFormatter?: (date: string) => string,
    ) =>
    ({ payload }: any) => {
        if (!payload?.[0]) return null
        const data = payload[0].payload
        return (
            <TimeSeriesChartTooltip
                date={dateFormatter ? dateFormatter(data.date) : data.date}
                value={data.value}
                valueFormatter={valueFormatter}
            />
        )
    }

export const TimeSeriesChart = ({
    containerHeight,
    containerWidth,
    data,
    isLoading = false,
    valueFormatter,
    yAxisFormatter,
    dateFormatter,
    color = DEFAULT_COLOR,
    useGradient = true,
    chartHeight = DEFAULT_CHART_HEIGHT,
}: TimeSeriesChartProps) => {
    if (isLoading) {
        return (
            <Box
                flexDirection="column"
                width={containerWidth}
                height={containerHeight}
                gap="lg"
            >
                <TimeSeriesChartSkeleton chartHeight={chartHeight} />
            </Box>
        )
    }

    const gradientId = `timeSeriesGradient-${color.replace('#', '')}`

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="lg"
            className={css.chartContainer}
        >
            <div className={css.chartWrapper}>
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        {useGradient && (
                            <defs>
                                <linearGradient
                                    id={gradientId}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor={color}
                                        stopOpacity={0.2}
                                    />
                                    <stop
                                        offset="50%"
                                        stopColor={color}
                                        stopOpacity={0.1}
                                    />
                                    <stop
                                        offset="75%"
                                        stopColor={color}
                                        stopOpacity={0.05}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={color}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                        )}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={GRID_COLOR}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: TICK_COLOR, fontSize: 12 }}
                            axisLine={false}
                            tickLine={{ stroke: GRID_COLOR }}
                            tickMargin={8}
                        />
                        <YAxis
                            tick={{ fill: TICK_COLOR, fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={yAxisFormatter}
                            width={40}
                        />
                        <Tooltip
                            content={renderTimeSeriesTooltipContent(
                                valueFormatter,
                                dateFormatter,
                            )}
                            cursor={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={1.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fillOpacity={1}
                            fill={useGradient ? `url(#${gradientId})` : color}
                            isAnimationActive={true}
                            animationDuration={1000}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Box>
    )
}
