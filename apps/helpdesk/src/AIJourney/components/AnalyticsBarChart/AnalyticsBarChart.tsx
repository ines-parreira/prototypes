import { useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import moment from 'moment'

import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'

import { Tooltip } from '../Tooltip/Tooltip'

import css from './AnalyticsBarChart.less'

export type DataArrayType = {
    dateRange: {
        startDate: string
        endDate: string
    }
    value: MetricProps[]
}

type AnalyticsBarChartProps = {
    dataArray: DataArrayType[]
    metricIndex: number // Add this prop to know which metric to display
}

export const AnalyticsBarChart = ({
    dataArray,
    metricIndex,
}: AnalyticsBarChartProps) => {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null)

    const transformedData = useMemo(() => {
        if (!dataArray.length) return []

        return dataArray.map((item) => {
            const metricValue = item.value[metricIndex]?.value || 0
            return {
                dateRange: {
                    startDate: item.dateRange.startDate,
                    endDate: item.dateRange.endDate,
                    formatted: `${moment(item.dateRange.startDate).format('MMM D')} - ${moment(item.dateRange.endDate).format('MMM D')}`,
                },
                formattedValue: formatMetricValue(
                    metricValue,
                    item.value[metricIndex].metricFormat,
                    undefined,
                    item.value[metricIndex].currency,
                ),
                value: metricValue,
            }
        })
    }, [dataArray, metricIndex])

    const highestValue = Math.max(...transformedData.map((v) => v.value || 0))
    const lowestValue = Math.min(...transformedData.map((v) => v.value || 0))

    const getBarHeightFactor = (
        value: number,
        highestValue: number,
        lowestValue: number,
    ) => {
        const TOP_FACTOR = 1
        const BOTTOM_FACTOR = 0.2

        if (highestValue === 0) return BOTTOM_FACTOR

        if (highestValue === lowestValue) return TOP_FACTOR

        return (
            TOP_FACTOR +
            ((value - highestValue) * (BOTTOM_FACTOR - TOP_FACTOR)) /
                (lowestValue - highestValue)
        )
    }

    return (
        <div className={css.barsContainer}>
            {transformedData.map((data, barIndex) => (
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
                            date={data.dateRange.formatted}
                            info={data.formattedValue}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
