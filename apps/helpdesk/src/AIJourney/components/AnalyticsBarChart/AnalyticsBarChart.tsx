import { useMemo, useState } from 'react'

import { motion } from 'framer-motion'
import moment from 'moment'

import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    formatMetricValue,
    MetricTrendFormat,
} from 'domains/reporting/pages/common/utils'

import { Tooltip } from '../Tooltip/Tooltip'

import css from './AnalyticsBarChart.less'

type AnalyticsBarChartProps = {
    data: TimeSeriesDataItem[]
    metricFormat: MetricTrendFormat
    currency?: string
    period: {
        start: string
        end: string
    }
}

export const AnalyticsBarChart = ({
    data,
    metricFormat,
    currency,
    period,
}: AnalyticsBarChartProps) => {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null)

    const transformedData = useMemo(() => {
        if (!data.length) {
            return []
        }

        return data.map((item, index) => {
            const metricValue = item.value ?? 0
            const nextStartDate = data[index + 1]?.dateTime
            let endDate: string
            if (nextStartDate) {
                endDate = moment(nextStartDate)
                    .subtract(1, 'day')
                    .format('MMM D')
            } else {
                endDate = moment(period.end).format('MMM D')
            }

            return {
                formattedDate: `${moment(item.dateTime).format('MMM D')} - ${endDate}`,
                formattedValue: formatMetricValue(
                    metricValue,
                    metricFormat,
                    undefined,
                    currency,
                ),
                value: metricValue,
            }
        })
    }, [data, metricFormat, currency, period.end])

    const highestValue = Math.max(...transformedData.map((v) => v.value ?? 0))
    const lowestValue = Math.min(...transformedData.map((v) => v.value ?? 0))

    const getBarHeightFactor = (
        value: number,
        highestValue: number,
        lowestValue: number,
    ) => {
        const TOP_FACTOR = 1
        const BOTTOM_FACTOR = 0.2

        if (highestValue === 0) {
            return BOTTOM_FACTOR
        }

        if (highestValue === lowestValue) {
            return TOP_FACTOR
        }

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
                            date={data.formattedDate}
                            info={data.formattedValue}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
