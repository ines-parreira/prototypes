import { useMemo } from 'react'

import _zip from 'lodash/zip'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import { useCustomFieldsTicketCountTimeSeries } from 'domains/reporting/hooks/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    BREAKDOWN_FIELD,
    selectTimeSeriesWithBreakdown,
    TicketCustomFieldsTicketCountTimeSeriesData,
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    getCustomFieldsOrder,
    TicketInsightsOrder,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { getFilterDateRange } from 'domains/reporting/utils/reporting'
import useAppSelector from 'hooks/useAppSelector'
import { WithChildren } from 'pages/common/components/table/TableBodyRowExpandable'
import { notUndefined } from 'utils/types'

const breakdownTimeSeries = (
    timeSeriesData: Record<string, TimeSeriesDataItem[][]>,
    order: TicketInsightsOrder,
    breakdownField: TicketCustomFieldsDimension.TicketCustomFieldsValue,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
): WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[] => {
    const timeSeriesObjects = Object.keys(timeSeriesData).map((key) => ({
        [breakdownField]: key,
        initialCustomFieldValue: [key],
        timeSeries: timeSeriesData[key][0],
    }))

    return selectTimeSeriesWithBreakdown(
        timeSeriesObjects,
        order,
        breakdownField,
        valueField,
    )
}

export const useCustomFieldsTicketCountPerCustomFields = (
    selectedCustomFieldId: number,
): {
    data: WithChildren<TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile>[]
    dateTimes: string[]
    isLoading: boolean
    order: TicketInsightsOrder
} => {
    const breakdownField = BREAKDOWN_FIELD
    const valueField = VALUE_FIELD

    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const order = useAppSelector(getCustomFieldsOrder)
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters.period),
        granularity,
    )

    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    const { data: timeSeriesData, isLoading } =
        useCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            selectedCustomFieldId,
            undefined,
            ticketFieldsTicketTimeReference,
        )

    const data = useMemo(
        () =>
            timeSeriesData !== undefined
                ? enrichWithPercentagesAndDeciles(
                      breakdownTimeSeries(
                          timeSeriesData,
                          order,
                          breakdownField,
                          valueField,
                      ),
                      valueField,
                  )
                : [],
        [timeSeriesData, order, breakdownField, valueField],
    )

    return {
        data,
        dateTimes,
        isLoading,
        order,
    }
}

export function enrichWithPercentagesAndDeciles(
    data: WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[],
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
    totalsSum?: number,
    topLevelTimeSeriesSums?: TimeSeriesDataItem[],
    totalsMax?: number,
): WithChildren<TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile>[] {
    const currentLevelTotalSum =
        totalsSum ||
        data.reduce(
            (acc, currentValue) => acc + (currentValue[valueField] || 0),
            0,
        )
    const columnsSum = _zip(...data.map((item) => item.timeSeries))
    const sums =
        topLevelTimeSeriesSums ||
        columnsSum.map((column) => {
            return column.filter(notUndefined).reduce((sum, point) => ({
                ...sum,
                value: sum.value + point.value,
            }))
        })
    const currentLevelMax =
        totalsMax ||
        Math.max(
            ...data.map((item) =>
                Math.max(...item.timeSeries.map((item) => item.value)),
            ),
        )

    return data.map((item) => ({
        ...item,
        percentage: ((item[valueField] || 0) / currentLevelTotalSum) * 100,
        decile: calculateDecile(item[valueField], currentLevelTotalSum),
        totalsDecile: calculateDecile(item[valueField], currentLevelMax),
        timeSeries: item.timeSeries.map((item, index) => ({
            ...item,
            percentage:
                sums[index].value !== 0
                    ? (item.value / sums[index].value) * 100
                    : 0,
            decile: calculateDecile(item.value, sums[index].value),
            totalsDecile: calculateDecile(item.value, currentLevelMax),
        })),
        children: enrichWithPercentagesAndDeciles(
            item.children,
            valueField,
            currentLevelTotalSum,
            sums,
            currentLevelMax,
        ),
    }))
}

export const calculateDecile = (value: number | undefined, sum: number) =>
    sum !== 0 ? Math.min(Math.round(((value || 0) / sum) * 10), 9) : 0
