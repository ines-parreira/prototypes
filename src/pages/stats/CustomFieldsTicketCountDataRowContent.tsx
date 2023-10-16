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

const EXPAND_COLUMN_WIDTH = 24
const DEFAULT_MARGIN = 8

export type DataRowProps =
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile & {
        level?: number
        isLoading?: boolean
        isTableScrolled?: boolean
        onClick?: () => void
        children?: TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile[]
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
    children,
}: DataRowProps) => {
    const valueMode = useAppSelector(getValueMode)
    const isHeatmapMode = useAppSelector(getHeatmapMode) && level === 0
    const hasChildren = Array.isArray(children) && children.length > 0

    return (
        <>
            <BodyCell
                className={classNames(
                    {[css.withShadow]: isTableScrolled},
                    css.sticky,
                    css.categoryColumn
                )}
                style={{left: `${EXPAND_COLUMN_WIDTH}px`}}
                innerStyle={{
                    ...(!hasChildren && {paddingLeft: 0}),
                    marginLeft: `${
                        level * EXPAND_COLUMN_WIDTH +
                        (!hasChildren ? DEFAULT_MARGIN : DEFAULT_MARGIN * 2)
                    }px`,
                }}
                onClick={onClick}
                innerClassName={css.small}
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
