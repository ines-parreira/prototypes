import { Box } from '@gorgias/axiom'

import { SimpleTrendCard } from '../SimpleTrendCard/SimpleTrendCard'

import css from './KeyMetricsSection.less'

export const KeyMetricsSection = () => {
    const metricsData = [
        {
            title: 'Overall automation rate',
            value: '32%',
            trend: -2,
            trendData: [
                { x: 'Jun 1', y: 31 },
                { x: 'Jun 2', y: 33 },
                { x: 'Jun 3', y: 32 },
                { x: 'Jun 4', y: 34 },
                { x: 'Jun 5', y: 33 },
                { x: 'Jun 6', y: 35 },
                { x: 'Jun 7', y: 32 },
            ],
        },
        {
            title: 'Automated interactions',
            value: '4,800',
            trend: -2,
            trendData: [
                { x: 'Jun 1', y: 4500 },
                { x: 'Jun 2', y: 4700 },
                { x: 'Jun 3', y: 4600 },
                { x: 'Jun 4', y: 4900 },
                { x: 'Jun 5', y: 4800 },
                { x: 'Jun 6', y: 5000 },
                { x: 'Jun 7', y: 4800 },
            ],
        },
        {
            title: 'Time saved by agents',
            value: '5h 30m',
            trend: 2,
            trendData: [
                { x: 'Jun 1', y: 18000 },
                { x: 'Jun 2', y: 19000 },
                { x: 'Jun 3', y: 18500 },
                { x: 'Jun 4', y: 20000 },
                { x: 'Jun 5', y: 19500 },
                { x: 'Jun 6', y: 20500 },
                { x: 'Jun 7', y: 19800 },
            ],
        },
        {
            title: 'Cost saved',
            value: '$2,400',
            trend: -2,
            trendData: [
                { x: 'Jun 1', y: 2200 },
                { x: 'Jun 2', y: 2400 },
                { x: 'Jun 3', y: 2300 },
                { x: 'Jun 4', y: 2500 },
                { x: 'Jun 5', y: 2450 },
                { x: 'Jun 6', y: 2600 },
                { x: 'Jun 7', y: 2400 },
            ],
        },
    ]

    return (
        <Box className={css.keyMetricsSection}>
            {metricsData.map((metric, index) => (
                <SimpleTrendCard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    trend={metric.trend}
                    trendData={metric.trendData}
                />
            ))}
        </Box>
    )
}
