import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts'

import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import css from './AutomationLineChart.less'

const SKELETON_DATA = [
    { x: 0, y: 0.3 },
    { x: 1, y: 0.35 },
    { x: 2, y: 0.55 },
    { x: 3, y: 0.5 },
    { x: 4, y: 0.6 },
    { x: 5, y: 0.58 },
    { x: 6, y: 0.7 },
    { x: 7, y: 0.65 },
    { x: 8, y: 0.68 },
    { x: 9, y: 0.72 },
    { x: 10, y: 0.68 },
    { x: 11, y: 0.75 },
    { x: 12, y: 0.7 },
    { x: 13, y: 0.65 },
    { x: 14, y: 0.6 },
]

const CHART_COLORS = {
    grid: colors['border-neutral-secondary'].$value,
    skeletonStroke: colors['border-neutral-tertiary'].$value,
}

export const AutomationLineChartSkeleton = () => {
    return (
        <div className={`${css.chartWrapper} ${css.skeletonChart}`}>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                    data={SKELETON_DATA}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="skeletonGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor={CHART_COLORS.skeletonStroke}
                                stopOpacity={0.1}
                            />
                            <stop
                                offset="100%"
                                stopColor={CHART_COLORS.skeletonStroke}
                                stopOpacity={0.02}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_COLORS.grid}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="x"
                        tick={{ fill: '#5C6370', fontSize: 12 }}
                        axisLine={false}
                        tickLine={{ stroke: CHART_COLORS.grid }}
                        tickMargin={8}
                        tickFormatter={() => ''}
                    />
                    <YAxis
                        tick={{ fill: '#5C6370', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={() => ''}
                        width={40}
                    />
                    <Area
                        type="monotone"
                        dataKey="y"
                        stroke={CHART_COLORS.skeletonStroke}
                        strokeWidth={3}
                        fill="url(#skeletonGradient)"
                        isAnimationActive={false}
                        opacity={0.4}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className={css.shimmerOverlay} />
        </div>
    )
}
