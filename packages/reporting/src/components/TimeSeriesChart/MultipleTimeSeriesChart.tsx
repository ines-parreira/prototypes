import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { SizeValue } from '@gorgias/axiom'
import { Box, Text } from '@gorgias/axiom'

import type { MultipleTimeSeriesDataItem } from '../ChartCard'
import { assignColorsToData } from '../ChartCard/utils/colorUtils'
import { ChartLegend } from '../ChartLegend/ChartLegend'
import { TimeSeriesChartSkeleton } from './TimeSeriesChartSkeleton'

import css from './TimeSeriesChart.less'

type TimeSeriesChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: MultipleTimeSeriesDataItem[]
    isLoading?: boolean
    valueFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    dateFormatter?: (date: string) => string
    chartHeight?: number
    withLegend?: boolean
    maxSeries?: number
}

const DEFAULT_CHART_HEIGHT = 280
const GRID_COLOR = 'var(--border-neutral-secondary)'
const TICK_COLOR = 'var(--content-neutral-tertiary)'

type FlatDataPoint = Record<string, string | number | null>

const getTopSeries = (
    data: MultipleTimeSeriesDataItem[],
    maxSeries?: number,
): MultipleTimeSeriesDataItem[] => {
    const sorted = [...data].sort((a, b) => {
        const sumA = a.values.reduce(
            (acc, point) => acc + (point.value ?? 0),
            0,
        )
        const sumB = b.values.reduce(
            (acc, point) => acc + (point.value ?? 0),
            0,
        )
        return sumB - sumA
    })
    return maxSeries !== undefined ? sorted.slice(0, maxSeries) : sorted
}

const transformToFlatData = (
    data: MultipleTimeSeriesDataItem[],
): FlatDataPoint[] => {
    const dateMap = new Map<string, FlatDataPoint>()

    for (const series of data) {
        for (const point of series.values) {
            if (!dateMap.has(point.date)) {
                dateMap.set(point.date, { date: point.date })
            }
            dateMap.get(point.date)![series.label] = point.value
        }
    }

    return Array.from(dateMap.values())
}

export const renderMultipleTimeSeriesTooltipContent =
    (
        valueFormatter?: (value: number) => string,
        dateFormatter?: (date: string) => string,
    ) =>
    ({ payload }: any) => {
        if (!payload?.[0]) return null
        const date = payload[0].payload.date

        return (
            <Box className={css.tooltip} flexDirection="column" gap="xxs">
                <Text size="sm" variant="regular" className={css.tooltipText}>
                    {dateFormatter ? dateFormatter(date) : date}
                </Text>
                {payload.map((entry: any) => (
                    <Box
                        key={entry.dataKey}
                        justifyContent="space-between"
                        gap="xxs"
                    >
                        <Text
                            size="sm"
                            variant="bold"
                            className={css.tooltipText}
                        >
                            {entry.dataKey}:
                        </Text>
                        <Text
                            size="sm"
                            variant="bold"
                            className={css.tooltipValue}
                        >
                            {valueFormatter
                                ? valueFormatter(entry.value)
                                : entry.value}
                        </Text>
                    </Box>
                ))}
            </Box>
        )
    }

export const MultipleTimeSeriesChart = ({
    containerHeight,
    containerWidth,
    data,
    isLoading = false,
    valueFormatter,
    yAxisFormatter,
    dateFormatter,
    chartHeight = DEFAULT_CHART_HEIGHT,
    withLegend = true,
    maxSeries = 5,
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

    const totalCount = data.length
    const visibleData = getTopSeries(data, maxSeries)
    const flatData = transformToFlatData(visibleData)
    const seriesWithColors = assignColorsToData(
        visibleData.map((series) => ({ name: series.label, value: 0 })),
    )
    const showTopSeriesNotice =
        totalCount !== undefined && totalCount > seriesWithColors.length

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="xs"
            className={css.chartContainer}
        >
            <div className={css.chartWrapper}>
                {showTopSeriesNotice && (
                    <Box justifyContent={'end'} marginTop={'-24px'}>
                        <Text
                            size="sm"
                            className={css.legendTotal}
                            variant="italic"
                        >
                            {`Showing the top ${seriesWithColors.length} out of ${totalCount}`}
                        </Text>
                    </Box>
                )}
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <LineChart
                        data={flatData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="0 6"
                            strokeLinecap="round"
                            stroke={GRID_COLOR}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: TICK_COLOR, fontSize: 12 }}
                            axisLine={false}
                            tickLine={{ stroke: GRID_COLOR, strokeWidth: 0.75 }}
                            minTickGap={8}
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
                            content={renderMultipleTimeSeriesTooltipContent(
                                valueFormatter,
                                dateFormatter,
                            )}
                            cursor={false}
                        />
                        {seriesWithColors.map((series) => (
                            <Line
                                key={series.name}
                                type="monotone"
                                dataKey={series.name}
                                stroke={series.color}
                                strokeWidth={1.2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                dot={false}
                                isAnimationActive={true}
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {withLegend && <ChartLegend seriesWithColors={seriesWithColors} />}
        </Box>
    )
}
