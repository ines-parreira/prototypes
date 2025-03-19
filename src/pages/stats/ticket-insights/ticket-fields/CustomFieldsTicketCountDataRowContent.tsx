import classNames from 'classnames'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    BREAKDOWN_FIELD,
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile,
    VALUE_FIELD,
} from 'hooks/reporting/withBreakdown'
import useAppSelector from 'hooks/useAppSelector'
import { SCREEN_SIZE, useScreenSize } from 'hooks/useScreenSize'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/BreakdownTable.less'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import heatmapCss from 'pages/stats/heatmap.less'
import {
    formatDates,
    getUtcPeriodFromDateAndGranularity,
} from 'pages/stats/utils'
import {
    getHeatmapMode,
    getValueMode,
} from 'state/ui/stats/ticketInsightsSlice'
import { TicketFieldsMetric, ValueMode } from 'state/ui/stats/types'

export const EXPAND_COLUMN_WIDTH = 24
export const MOBILE_EXPAND_COLUMN_WIDTH = 10
export const DEFAULT_MARGIN = 8

export type DataRowProps =
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile & {
        level?: number
        isLoading?: boolean
        isTableScrolled?: boolean
        onClick?: () => void
        children?: TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile[]
        selectedCustomField?: { id: number; label: string }
    }

const formatAccordingToValueMode =
    (valueMode: ValueMode) =>
    ({ value, percentage }: { value: number; percentage: number }) =>
        valueMode === ValueMode.Percentage
            ? formatMetricValue(
                  percentage !== 0 ? percentage : null,
                  'percent-refined',
                  NOT_AVAILABLE_PLACEHOLDER,
              )
            : formatMetricValue(
                  value !== 0 ? value : null,
                  'integer',
                  NOT_AVAILABLE_PLACEHOLDER,
              )

export const CustomFieldsTicketCountDataRowContent = (props: DataRowProps) => {
    const {
        isTableScrolled = false,
        timeSeries,
        initialCustomFieldValue,
        selectedCustomField,
        percentage,
        decile,
        totalsDecile,
        level = 0,
        onClick,
        children,
    } = props
    const breakdownField = BREAKDOWN_FIELD
    const valueField = VALUE_FIELD
    const label = props[breakdownField]
    const value = props[valueField] ?? 0

    const valueMode = useAppSelector(getValueMode)
    const isHeatmapMode = useAppSelector(getHeatmapMode) && level === 0
    const hasChildren = Array.isArray(children) && children.length > 0
    const { granularity } = useStatsFilters()
    const isMobile = useScreenSize() === SCREEN_SIZE.SMALL

    return (
        <>
            <BodyCell
                className={classNames(
                    { [css.withShadow]: isTableScrolled },
                    css.sticky,
                    css.categoryColumn,
                )}
                style={{ left: `${EXPAND_COLUMN_WIDTH}px` }}
                innerStyle={{
                    ...(!hasChildren && { paddingLeft: 0 }),
                    marginLeft: `${
                        level *
                            (isMobile
                                ? MOBILE_EXPAND_COLUMN_WIDTH
                                : EXPAND_COLUMN_WIDTH) +
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
                    isHeatmapMode && [heatmapCss.heatmap],
                    isHeatmapMode &&
                        heatmapCss[
                            `p${
                                valueMode === ValueMode.TotalCount
                                    ? String(totalsDecile)
                                    : String(decile)
                            }`
                        ],
                )}
                innerClassName={classNames(css.BodyCellContent)}
                justifyContent={'right'}
            >
                <DrillDownModalTrigger
                    enabled={
                        formatAccordingToValueMode(valueMode)({
                            value: value,
                            percentage,
                        }) !== NOT_AVAILABLE_PLACEHOLDER
                    }
                    highlighted
                    metricData={{
                        title: `${String(
                            selectedCustomField?.label,
                        )} | ${label} | Total`,
                        metricName:
                            TicketFieldsMetric.TicketCustomFieldsTicketCount,
                        customFieldId: selectedCustomField?.id || null,
                        customFieldValue: initialCustomFieldValue,
                    }}
                >
                    {formatAccordingToValueMode(valueMode)({
                        value: value,
                        percentage,
                    })}
                </DrillDownModalTrigger>
            </BodyCell>
            {timeSeries.map((data) => (
                <BodyCell
                    key={data.dateTime}
                    className={classNames(
                        css.BodyCell,
                        isHeatmapMode && [heatmapCss.heatmap],
                        isHeatmapMode &&
                            heatmapCss[
                                `p${
                                    valueMode === ValueMode.TotalCount
                                        ? String(data.totalsDecile)
                                        : String(data.decile)
                                }`
                            ],
                    )}
                    innerClassName={classNames(
                        css.BodyCellContent,
                        data.value === 0 && css.emptyValue,
                    )}
                    justifyContent={'right'}
                >
                    <DrillDownModalTrigger
                        enabled={
                            formatAccordingToValueMode(valueMode)(data) !==
                            NOT_AVAILABLE_PLACEHOLDER
                        }
                        highlighted
                        metricData={{
                            title: `${String(
                                selectedCustomField?.label,
                            )} | ${label} | ${formatDates(
                                granularity,
                                data.dateTime,
                            )}`,
                            metricName:
                                TicketFieldsMetric.TicketCustomFieldsTicketCount,
                            customFieldId: selectedCustomField?.id || null,
                            customFieldValue: initialCustomFieldValue,
                            dateRange: getUtcPeriodFromDateAndGranularity(
                                data.dateTime,
                                granularity,
                            ),
                        }}
                    >
                        {formatAccordingToValueMode(valueMode)(data)}
                    </DrillDownModalTrigger>
                </BodyCell>
            ))}
        </>
    )
}
