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
import type { ChartDataItemWithColor } from '../ChartCard/utils/colorUtils'
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
}

const DEFAULT_CHART_HEIGHT = 280
const GRID_COLOR = 'var(--border-neutral-secondary)'
const TICK_COLOR = 'var(--content-neutral-tertiary)'

type FlatDataPoint = Record<string, string | number | null>

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

export const MultipleTimeSeriesLegend = ({
    seriesWithColors,
}: {
    seriesWithColors: ChartDataItemWithColor[]
}) => {
    return (
        <div className={css.legend}>
            {seriesWithColors.map((series) => (
                <div key={series.name} className={css.legendItem}>
                    <div
                        className={css.legendDot}
                        style={{ backgroundColor: series.color }}
                    />
                    {series.name}
                </div>
            ))}
        </div>
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

    const flatData = transformToFlatData(data)
    const seriesWithColors = assignColorsToData(
        data.map((series) => ({ name: series.label, value: 0 })),
    )

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="xs"
            className={css.chartContainer}
        >
            <div className={css.chartWrapper}>
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
            {withLegend && (
                <MultipleTimeSeriesLegend seriesWithColors={seriesWithColors} />
            )}
        </Box>
    )
}
