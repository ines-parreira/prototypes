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

import { BarChartTooltip } from '../ChartCard/components/BarChartTooltip'
import type { ChartDataItem } from '../ChartCard/types'
import { assignColorsToData } from '../ChartCard/utils/colorUtils'

import css from './BarChart.less'

type BarChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    data: ChartDataItem[]
    isLoading?: boolean
}

const CHART_HEIGHT = 300

export const renderBarTooltipContent = ({ payload }: any) => {
    if (!payload?.[0]) return null
    const data = payload[0].payload
    return (
        <BarChartTooltip
            name={data.name}
            value={data.value}
            color={data.color}
        />
    )
}

export const BarChart = ({
    containerHeight,
    containerWidth,
    data,
    isLoading = false,
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
                <RechartsBarChart
                    data={dataWithColors}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
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
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        content={renderBarTooltipContent}
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
