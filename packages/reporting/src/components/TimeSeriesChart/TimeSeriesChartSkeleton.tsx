import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts'

import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import css from './TimeSeriesChart.less'

const SKELETON_DATA = [
    { date: '0', value: 0.3 },
    { date: '1', value: 0.35 },
    { date: '2', value: 0.55 },
    { date: '3', value: 0.5 },
    { date: '4', value: 0.6 },
    { date: '5', value: 0.58 },
    { date: '6', value: 0.7 },
    { date: '7', value: 0.65 },
    { date: '8', value: 0.68 },
    { date: '9', value: 0.72 },
    { date: '10', value: 0.68 },
    { date: '11', value: 0.75 },
    { date: '12', value: 0.7 },
    { date: '13', value: 0.65 },
    { date: '14', value: 0.6 },
]

const GRID_COLOR = colors['border-neutral-secondary'].$value
const TICK_COLOR = '#5C6370'
const SKELETON_STROKE_COLOR = colors['border-neutral-tertiary'].$value

type TimeSeriesChartSkeletonProps = {
    chartHeight: number
}

export const TimeSeriesChartSkeleton = ({
    chartHeight,
}: TimeSeriesChartSkeletonProps) => {
    return (
        <div className={`${css.chartWrapper} ${css.skeletonChart}`}>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <AreaChart
                    data={SKELETON_DATA}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="timeSeriesSkeletonGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor={SKELETON_STROKE_COLOR}
                                stopOpacity={0.1}
                            />
                            <stop
                                offset="100%"
                                stopColor={SKELETON_STROKE_COLOR}
                                stopOpacity={0.02}
                            />
                        </linearGradient>
                    </defs>
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
                        tickFormatter={() => ''}
                    />
                    <YAxis
                        tick={{ fill: TICK_COLOR, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={() => ''}
                        width={40}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={SKELETON_STROKE_COLOR}
                        strokeWidth={3}
                        fill="url(#timeSeriesSkeletonGradient)"
                        isAnimationActive={false}
                        opacity={0.4}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className={css.shimmerOverlay} />
        </div>
    )
}
