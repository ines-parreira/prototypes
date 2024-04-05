import classnames from 'classnames'
import React from 'react'
import css from 'pages/stats/heatmap.less'
import {hourFromHourIndex} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/AgentsTableConfig'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    BTODColumns,
    BusiestTimeOfDaysMetrics,
    isHourCell,
} from 'pages/stats/support-performance/busiest-times-of-days/types'

export const BusiestTimesOfDaysCellContent = ({
    isLoading,
    metricValue,
    hour,
    day,
    width,
    className,
    isHeatmapMode,
    decile,
}: {
    isLoading: boolean
    metricValue: number
    decile: number
    metricName: BusiestTimeOfDaysMetrics
    hour: number
    day: BTODColumns
    width?: number
    className?: string
    isHeatmapMode: boolean
}) => {
    return (
        <BodyCell
            width={width}
            className={classnames(
                className,
                [css.heatmap],
                isHeatmapMode && !isLoading && css[`p${String(decile)}`]
            )}
            justifyContent={'center'}
        >
            <Content
                day={day}
                isLoading={isLoading}
                hour={hour}
                metricValue={metricValue}
            />
        </BodyCell>
    )
}

const Content = ({
    isLoading,
    day,
    hour,
    metricValue,
}: {
    isLoading: boolean
    metricValue: number
    hour: number
    day: BTODColumns
}) => {
    if (isLoading) return <Skeleton inline width={METRIC_COLUMN_WIDTH} />
    if (isHourCell(day)) return <>{hourFromHourIndex(hour)}</>
    return (
        <span>
            {formatMetricValue(
                metricValue,
                'integer',
                NOT_AVAILABLE_PLACEHOLDER
            )}
        </span>
    )
}
