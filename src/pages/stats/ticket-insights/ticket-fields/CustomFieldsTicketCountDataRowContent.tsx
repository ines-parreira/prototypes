import classNames from 'classnames'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import {
    BREAKDOWN_FIELD,
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile,
    VALUE_FIELD,
} from 'hooks/reporting/withBreakdown'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'
import heatmapCss from 'pages/stats/common/components/Table/heatmap.less'
import { TableWithNestedRowsCell } from 'pages/stats/common/components/Table/TableWithNestedRowsCell'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    formatDates,
    getUtcPeriodFromDateAndGranularity,
} from 'pages/stats/utils'
import {
    getHeatmapMode,
    getValueMode,
} from 'state/ui/stats/ticketInsightsSlice'
import { TicketFieldsMetric, ValueMode } from 'state/ui/stats/types'

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

    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    const valueMode = useAppSelector(getValueMode)
    const isHeatmapMode = useAppSelector(getHeatmapMode) && level === 0
    const hasChildren = Array.isArray(children) && children.length > 0
    const { granularity } = useStatsFilters()

    return (
        <>
            <TableWithNestedRowsCell
                isLeadColumn={true}
                isTableScrolled={isTableScrolled}
                hasChildren={hasChildren}
                onClick={onClick}
                level={level}
            >
                {label}
            </TableWithNestedRowsCell>
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
                        ticketTimeReference: ticketFieldsTicketTimeReference,
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
                            ticketTimeReference:
                                ticketFieldsTicketTimeReference,
                        }}
                    >
                        {formatAccordingToValueMode(valueMode)(data)}
                    </DrillDownModalTrigger>
                </BodyCell>
            ))}
        </>
    )
}
