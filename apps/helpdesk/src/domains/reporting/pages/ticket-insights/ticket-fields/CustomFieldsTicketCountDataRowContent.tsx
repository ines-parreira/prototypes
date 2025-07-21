import classNames from 'classnames'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import {
    BREAKDOWN_FIELD,
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import css from 'domains/reporting/pages/common/components/Table/BreakdownTable.less'
import heatmapCss from 'domains/reporting/pages/common/components/Table/heatmap.less'
import { TableWithNestedRowsCell } from 'domains/reporting/pages/common/components/Table/TableWithNestedRowsCell'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import {
    formatDates,
    getUtcPeriodFromDateAndGranularity,
} from 'domains/reporting/pages/utils'
import {
    getHeatmapMode,
    getValueMode,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import {
    TicketFieldsMetric,
    ValueMode,
} from 'domains/reporting/state/ui/stats/types'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

export type WithSelectedCustomField = {
    selectedCustomField: { id: number; label: string }
}

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

export const CustomFieldsTicketCountDataRowContent = (
    props: DataRowProps & { tableProps: WithSelectedCustomField },
) => {
    const {
        isTableScrolled = false,
        timeSeries,
        initialCustomFieldValue,
        tableProps,
        percentage,
        decile,
        totalsDecile,
        level = 0,
        onClick,
        children,
    } = props
    const { selectedCustomField } = tableProps
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
                isLeadColumn
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
                    highlighted={!isHeatmapMode}
                    metricData={{
                        title: `${String(
                            selectedCustomField?.label,
                        )} | ${label} | Total`,
                        metricName:
                            TicketFieldsMetric.TicketCustomFieldsTicketCount,
                        customFieldId: selectedCustomField.id,
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
                        highlighted={!isHeatmapMode}
                        metricData={{
                            title: `${String(
                                selectedCustomField?.label,
                            )} | ${label} | ${formatDates(
                                granularity,
                                data.dateTime,
                            )}`,
                            metricName:
                                TicketFieldsMetric.TicketCustomFieldsTicketCount,
                            customFieldId: selectedCustomField.id,
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
