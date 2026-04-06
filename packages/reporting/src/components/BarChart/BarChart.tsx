import {
    Bar,
    CartesianGrid,
    Cell,
    BarChart as RechartsBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { SizeValue } from '@gorgias/axiom'
import { Box, Skeleton } from '@gorgias/axiom'

import type { ChartDataItem } from '../ChartCard'
import { assignColorsToData } from '../ChartCard/utils/colorUtils'
import { ChartLegend } from '../ChartLegend/ChartLegend'
import { BarChartTooltip } from './BarChartTooltip'

import css from './BarChart.less'

type BarChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: ChartDataItem[]
    isLoading?: boolean
    valueFormatter?: (value: number) => string
    yAxisFormatter?: (value: number) => string
    period?: {
        start_datetime: string
        end_datetime: string
    }
    withLegend?: boolean
    maxBarSize?: number
    chartHeight?: number
}

const CHART_HEIGHT = 300

export const renderBarTooltipContent =
    (
        valueFormatter?: (value: number) => string,
        period?: {
            start_datetime: string
            end_datetime: string
        },
    ) =>
    ({ payload }: any) => {
        if (!payload?.[0]) return null
        const data = payload[0].payload
        return (
            <BarChartTooltip
                name={data.name}
                value={data.value}
                color={data.color}
                valueFormatter={valueFormatter}
                period={period}
            />
        )
    }

export const BarChart = ({
    containerHeight,
    containerWidth,
    data,
    isLoading = false,
    valueFormatter,
    yAxisFormatter,
    period,
    withLegend = false,
    maxBarSize,
    chartHeight = CHART_HEIGHT,
}: BarChartProps) => {
    const dataWithColors = assignColorsToData(data)

    if (isLoading) {
        return (
            <Box
                flexDirection="column"
                width={containerWidth}
                height={containerHeight}
                gap="lg"
            >
                <Box
                    flexDirection="row"
                    justifyContent="stretch"
                    alignItems="flex-end"
                    flexWrap="nowrap"
                    height={chartHeight}
                    gap="xs"
                    pl="xs"
                    pr="xs"
                    className={css.chartSkeleton}
                >
                    <Skeleton height={chartHeight / 4} width={maxBarSize} />
                    <Skeleton height={chartHeight / 2} width={maxBarSize} />
                    <Skeleton height={chartHeight / 1.5} width={maxBarSize} />
                    <Skeleton height={chartHeight / 3} width={maxBarSize} />
                </Box>
            </Box>
        )
    }

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="xs"
            className={css.chartContainer}
        >
            <ResponsiveContainer width="100%" height={chartHeight}>
                <RechartsBarChart data={dataWithColors}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E5E5"
                    />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        width="auto"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={yAxisFormatter}
                    />
                    <Tooltip
                        content={renderBarTooltipContent(
                            valueFormatter,
                            period,
                        )}
                        cursor={{ fill: 'rgba(160, 132, 225, 0.1)' }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={maxBarSize}
                    >
                        {dataWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
            {withLegend && <ChartLegend seriesWithColors={dataWithColors} />}
        </Box>
    )
}
