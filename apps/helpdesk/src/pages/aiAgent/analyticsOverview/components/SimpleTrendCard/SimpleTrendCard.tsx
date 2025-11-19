import { Area, AreaChart, ResponsiveContainer } from 'recharts'

import { Box, Card, Icon } from '@gorgias/axiom'

import css from './SimpleTrendCard.less'

type SimpleTrendCardProps = {
    title: string
    value: string
    trend: number
    trendData: Array<{ x: string; y: number }>
    trendColor?: string
}

export const SimpleTrendCard = ({
    title,
    value,
    trend,
    trendData,
    trendColor = '#6366F1',
}: SimpleTrendCardProps) => {
    const isPositive = trend > 0
    const isNegative = trend < 0
    const trendIcon = isPositive
        ? 'trending-up'
        : isNegative
          ? 'trending-down'
          : 'trending-up'

    return (
        <Card className={css.card}>
            <Box className={css.header}>
                <span className={css.title}>{title}</span>
                <Icon name="info" size="xs" />
            </Box>
            <Box className={css.content}>
                <Box className={css.valueRow}>
                    <span className={css.value}>{value}</span>
                    <Box
                        className={`${css.trend} ${isNegative ? css.negative : css.positive}`}
                    >
                        <Icon name={trendIcon} size="xs" />
                        <span>{Math.abs(trend)}%</span>
                    </Box>
                </Box>
                <Box className={css.chartContainer}>
                    <ResponsiveContainer width="100%" height={30}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient
                                    id={`gradient-${title}`}
                                    x1="0"
                                    y1="1"
                                    x2="1"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor={trendColor}
                                        stopOpacity={0.02}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={trendColor}
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke={trendColor}
                                strokeWidth={1.5}
                                fill={`url(#gradient-${title})`}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </Box>
        </Card>
    )
}
