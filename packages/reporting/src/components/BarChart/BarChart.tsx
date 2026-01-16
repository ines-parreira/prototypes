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

import type { ChartDataItem } from '../ChartCard/types'
import { assignColorsToData } from '../ChartCard/utils/colorUtils'
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
                    height={CHART_HEIGHT}
                    gap="xs"
                    pl="xs"
                    pr="xs"
                    className={css.chartSkeleton}
                >
                    <Skeleton height={CHART_HEIGHT / 4} />
                    <Skeleton height={CHART_HEIGHT / 2} />
                    <Skeleton height={CHART_HEIGHT / 1.5} />
                    <Skeleton height={CHART_HEIGHT / 3} />
                </Box>
            </Box>
        )
    }

    return (
        <Box
            flexDirection="column"
            width={containerWidth}
            height={containerHeight}
            gap="lg"
            className={css.chartContainer}
        >
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
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
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {dataWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </Box>
    )
}
