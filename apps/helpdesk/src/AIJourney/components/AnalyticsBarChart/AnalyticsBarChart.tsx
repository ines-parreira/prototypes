import { useState } from 'react'

import { motion } from 'framer-motion'

import { Tooltip } from '../Tooltip/Tooltip'

import css from './AnalyticsBarChart.less'

type AnalyticsBarChartProps = {
    dataArray: any[]
}

export const AnalyticsBarChart = ({ dataArray }: AnalyticsBarChartProps) => {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null)

    const highestValue = Math.max(...dataArray.map((v) => v.value))
    const lowestValue = Math.min(...dataArray.map((v) => v.value))

    const getBarHeightFactor = (
        value: number,
        highestValue: number,
        lowestValue: number,
    ) => {
        const TOP_FACTOR = 1
        const BOTTOM_FACTOR = 0.4

        return (
            TOP_FACTOR +
            ((value - highestValue) * (BOTTOM_FACTOR - TOP_FACTOR)) /
                (lowestValue - highestValue)
        )
    }

    return (
        <div className={css.barsContainer}>
            {dataArray.map((data, barIndex) => (
                <div key={barIndex} style={{ position: 'relative' }}>
                    <motion.div
                        style={{
                            height: `${getBarHeightFactor(data.value, highestValue, lowestValue) * 25}px`,
                        }}
                        className={css.bar}
                        initial={{ height: 0 }}
                        animate={{
                            height: `${getBarHeightFactor(data.value, highestValue, lowestValue) * 25}px`,
                        }}
                        transition={{
                            duration: 0.7,
                            delay: barIndex * 0.1,
                        }}
                        onMouseEnter={() => setHoveredBar(barIndex)}
                        onMouseLeave={() => setHoveredBar(null)}
                    />
                    {hoveredBar === barIndex && (
                        <Tooltip
                            date={data.dateRange}
                            info={data.value.toString()}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
