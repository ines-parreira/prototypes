import classNames from 'classnames'
import React from 'react'
import heatmapCss from 'pages/stats/heatmap.less'
import {
    BREAKDOWN_FIELD,
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile,
    VALUE_FIELD,
} from 'hooks/reporting/withBreakdown'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/BreakdownTable.less'
import {
    getHeatmapMode,
    getValueMode,
    ValueMode,
} from 'state/ui/stats/ticketInsightsSlice'
import {formatMetricValue} from 'pages/stats/common/utils'

const EXPAND_COLUMN_WIDTH = 45

export type DataRowProps =
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile & {
        level?: number
        isLoading?: boolean
        isTableScrolled?: boolean
        onClick?: () => void
    }

const formatAccordingToValueMode =
    (valueMode: ValueMode) =>
    ({value, percentage}: {value: number; percentage: number}) =>
        valueMode === ValueMode.Percentage
            ? formatMetricValue(percentage, 'percent-refined')
            : formatMetricValue(value, 'integer')

export const CustomFieldsTicketCountDataRowContent = ({
    isTableScrolled = false,
    timeSeries,
    [BREAKDOWN_FIELD]: label,
    [VALUE_FIELD]: value = 0,
    percentage,
    decile,
    level = 0,
    onClick,
}: DataRowProps) => {
    const valueMode = useAppSelector(getValueMode)
    const isHeatmapMode = useAppSelector(getHeatmapMode) && level === 0

    return (
        <>
            <BodyCell
                className={classNames(
                    {[css.withShadow]: isTableScrolled},
                    css.sticky,
                    css.categoryColumn
                )}
                style={{
                    left: `${(level + 1) * EXPAND_COLUMN_WIDTH}px`,
                }}
                onClick={onClick}
            >
                {label}
            </BodyCell>
            <BodyCell
                isHighlighted={true}
                className={classNames(
                    css.BodyCell,
                    [heatmapCss.heatmap],
                    isHeatmapMode && heatmapCss[`p${String(decile)}`]
                )}
                innerClassName={classNames(css.BodyCellContent)}
                justifyContent={'right'}
            >
                {formatAccordingToValueMode(valueMode)({
                    value: value,
                    percentage,
                })}
            </BodyCell>
            {timeSeries.map((data) => (
                <BodyCell
                    key={data.dateTime}
                    className={classNames(
                        css.BodyCell,
                        [heatmapCss.heatmap],
                        isHeatmapMode && heatmapCss[`p${String(data.decile)}`]
                    )}
                    innerClassName={classNames(css.BodyCellContent)}
                    justifyContent={'right'}
                >
                    {formatAccordingToValueMode(valueMode)(data)}
                </BodyCell>
            ))}
        </>
    )
}
