import classnames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import heatmapCss from 'domains/reporting/pages/common/components/Table/heatmap.less'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { METRIC_COLUMN_WIDTH } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import css from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDays.less'
import {
    BTODColumns,
    BusiestTimeOfDaysMetrics,
    isHourCell,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { hourFromHourIndex } from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

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
    const isFirstCol = isHourCell(day)
    const justify = isFirstCol ? 'left' : 'center'
    const shouldRespectHeatmapMode = metricValue && !isFirstCol

    return (
        <BodyCell
            width={width}
            className={classnames(
                className,
                [heatmapCss.heatmap],
                isHeatmapMode &&
                    !isLoading &&
                    shouldRespectHeatmapMode &&
                    heatmapCss[`p${String(decile)}`],
                isWorkingHour && css.redTransparentStripesPseudoElement,
                css.cellContent,
            )}
            innerClassName={classnames(
                [heatmapCss.heatmap],
                isHeatmapMode &&
                    !isLoading &&
                    shouldRespectHeatmapMode &&
                    heatmapCss[`p${String(decile)}`],
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
                NOT_AVAILABLE_PLACEHOLDER,
            )}
        </span>
    )
}
