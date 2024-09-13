import classnames from 'classnames'
import React from 'react'
import heatmapCss from 'pages/stats/heatmap.less'
import {hourFromHourIndex} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {METRIC_COLUMN_WIDTH} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    BTODColumns,
    BusiestTimeOfDaysMetrics,
    HOUR_COLUMN,
    isHourCell,
} from 'pages/stats/support-performance/busiest-times-of-days/types'
import css from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays.less'

export const BusiestTimesOfDaysCellContent = ({
    isLoading,
    metricValue,
    hour,
    day,
    width,
    className,
    isHeatmapMode,
    decile,
    isWorkingHour,
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
    isWorkingHour: boolean
}) => {
    const justify = day === HOUR_COLUMN ? 'left' : 'center'

    return (
        <BodyCell
            width={width}
            className={classnames(
                className,
                [heatmapCss.heatmap],
                isHeatmapMode && !isLoading && heatmapCss[`p${String(decile)}`],
                isWorkingHour && css.redTransparentStripesPseudoElement
            )}
            innerClassName={classnames(
                [heatmapCss.heatmap],
                isHeatmapMode && !isLoading && heatmapCss[`p${String(decile)}`],
                css.cellContent
            )}
            justifyContent={justify}
            size={'small'}
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
                metricValue === 0 ? null : metricValue,
                'integer',
                NOT_AVAILABLE_PLACEHOLDER
            )}
        </span>
    )
}
