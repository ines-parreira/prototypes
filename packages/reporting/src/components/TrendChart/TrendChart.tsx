import {
    Area,
    AreaChart as AreaChartRecharts,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import type { ContentType } from 'recharts/types/component/Tooltip'
import type { CartesianChartProps } from 'recharts/types/util/types'

import type { TrendColor, TwoDimensionalDataItem } from '../../types'
import { toChartData } from '../LineChart/utils'

export type AreaChartProps = {
    data: TwoDimensionalDataItem[]
    isStrokeSolid?: boolean
    areaChartProps?: CartesianChartProps & React.RefAttributes<SVGSVGElement>
    trendColor: TrendColor
    customColor?: string
    showAxes?: boolean
    showGrid?: boolean
    showTooltip?: boolean
    xAxisProps?: {
        dataKey?: string
        tickFormatter?: (value: string) => string
    }
    yAxisProps?: {
        tickFormatter?: (value: number) => string
        width?: number
    }
    gridProps?: {
        strokeDasharray?: string
        stroke?: string
    }
    tooltipContent?: ContentType<number | string, string | number>
}

export const TrendChart = ({
    areaChartProps,
    data,
    isStrokeSolid = false,
    trendColor,
    customColor,
    showAxes = false,
    showGrid = false,
    showTooltip = false,
    xAxisProps,
    yAxisProps,
    gridProps,
    tooltipContent,
}: AreaChartProps) => {
    const transformedData = toChartData(data)

    const trendColorValue = {
        neutral: '#5C6370',
        unchanged: '#5C6370',
        positive: '#0EAA77',
        negative: '#FF425D',
    }

    const color = customColor || trendColorValue[trendColor]
    const gradientId = customColor ? 'customColorGradient' : 'colorUv'
    const strokeGradientId = customColor
        ? 'customStrokeGradient'
        : 'strokeGradient'

    return (
        <AreaChartRecharts
            data={transformedData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            {...areaChartProps}
        >
            <defs>
                <linearGradient
                    id={gradientId}
                    x1="0"
                    y1={customColor ? '0' : '1'}
                    x2={customColor ? '0' : '1'}
                    y2={customColor ? '1' : '1'}
                >
                    <stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity={customColor ? 0.2 : 0.02}
                    />
                    <stop
                        offset="50%"
                        stopColor={color}
                        stopOpacity={customColor ? 0.1 : 0.05}
                    />
                    <stop
                        offset="75%"
                        stopColor={color}
                        stopOpacity={customColor ? 0.05 : 0.07}
                    />
                    <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={customColor ? 0 : 0.1}
                    />
                </linearGradient>
                {!isStrokeSolid && (
                    <linearGradient
                        id={strokeGradientId}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop
                            offset="0%"
                            stopColor={color}
                            stopOpacity={0.05}
                        />
                        <stop
                            offset="25%"
                            stopColor={color}
                            stopOpacity={0.05}
                        />
                        <stop
                            offset="50%"
                            stopColor={color}
                            stopOpacity={0.35}
                        />
                        <stop
                            offset="75%"
                            stopColor={color}
                            stopOpacity={0.5}
                        />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
                    </linearGradient>
                )}
            </defs>
            {showGrid && (
                <CartesianGrid
                    strokeDasharray={gridProps?.strokeDasharray || '1.5 3'}
                    stroke={gridProps?.stroke || '#B3B8C1'}
                    vertical={false}
                />
            )}
            {showAxes && (
                <>
                    <XAxis
                        dataKey={xAxisProps?.dataKey || 'name'}
                        tick={{ fill: '#5C6370', fontSize: 12 }}
                        axisLine={false}
                        tickLine={{ stroke: '#B3B8C1' }}
                        tickMargin={8}
                        tickFormatter={xAxisProps?.tickFormatter}
                    />
                    <YAxis
                        tick={{ fill: '#5C6370', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={yAxisProps?.tickFormatter}
                        width={yAxisProps?.width || 40}
                    />
                </>
            )}
            {showTooltip && <Tooltip content={tooltipContent} cursor={false} />}
            {data.map((series) => (
                <Area
                    type="monotone"
                    dataKey={series.label}
                    stroke={isStrokeSolid ? color : `url(#${strokeGradientId})`}
                    strokeWidth={customColor ? 2 : 1.5}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                    isAnimationActive={true}
                    animationDuration={customColor ? 1000 : 300}
                    animationEasing={customColor ? 'ease-in-out' : 'ease'}
                    activeDot={false}
                    key={series.label}
                />
            ))}
        </AreaChartRecharts>
    )
}
