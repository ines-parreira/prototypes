import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {FeatureFlagKey} from 'config/featureFlags'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import heatmapCss from 'pages/stats/heatmap.less'
import {
    BREAKDOWN_FIELD,
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile,
    VALUE_FIELD,
} from 'hooks/reporting/withBreakdown'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/BreakdownTable.less'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {
    getHeatmapMode,
    getValueMode,
    ValueMode,
} from 'state/ui/stats/ticketInsightsSlice'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'
import {TicketFieldsMetric} from 'state/ui/stats/types'
import {formatDates, getUtcPeriodFromDateAndGranularity} from './utils'

const EXPAND_COLUMN_WIDTH = 24
const DEFAULT_MARGIN = 8

export type DataRowProps =
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile & {
        level?: number
        isLoading?: boolean
        isTableScrolled?: boolean
        onClick?: () => void
        children?: TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile[]
        selectedCustomField?: {id: number; label: string}
    }

const formatAccordingToValueMode =
    (valueMode: ValueMode) =>
    ({value, percentage}: {value: number; percentage: number}) =>
        valueMode === ValueMode.Percentage
            ? formatMetricValue(
                  percentage !== 0 ? percentage : null,
                  'percent-refined',
                  NOT_AVAILABLE_PLACEHOLDER
              )
            : formatMetricValue(
                  value !== 0 ? value : null,
                  'integer',
                  NOT_AVAILABLE_PLACEHOLDER
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
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const breakdownField = isAnalyticsNewCubes
        ? renameMemberEnriched(BREAKDOWN_FIELD)
        : BREAKDOWN_FIELD
    const valueField = isAnalyticsNewCubes
        ? renameMemberEnriched(VALUE_FIELD)
        : VALUE_FIELD
    const label = props[breakdownField]
    const value = props[valueField] ?? 0

    const valueMode = useAppSelector(getValueMode)
    const isHeatmapMode = useAppSelector(getHeatmapMode) && level === 0
    const hasChildren = Array.isArray(children) && children.length > 0
    const {granularity} = useAppSelector(getCleanStatsFiltersWithTimezone)

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
                    isHeatmapMode && [heatmapCss.heatmap],
                    isHeatmapMode &&
                        heatmapCss[
                            `p${
                                valueMode === ValueMode.TotalCount
                                    ? String(totalsDecile)
                                    : String(decile)
                            }`
                        ]
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
                    metricData={{
                        title: `${String(
                            selectedCustomField?.label
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
                            ]
                    )}
                    innerClassName={classNames(
                        css.BodyCellContent,
                        data.value === 0 && css.emptyValue
                    )}
                    justifyContent={'right'}
                >
                    <DrillDownModalTrigger
                        enabled={
                            formatAccordingToValueMode(valueMode)(data) !==
                            NOT_AVAILABLE_PLACEHOLDER
                        }
                        metricData={{
                            title: `${String(
                                selectedCustomField?.label
                            )} | ${label} | ${formatDates(
                                granularity,
                                data.dateTime
                            )}`,
                            metricName:
                                TicketFieldsMetric.TicketCustomFieldsTicketCount,
                            customFieldId: selectedCustomField?.id || null,
                            customFieldValue: initialCustomFieldValue,
                            dateRange: getUtcPeriodFromDateAndGranularity(
                                data.dateTime,
                                granularity
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
