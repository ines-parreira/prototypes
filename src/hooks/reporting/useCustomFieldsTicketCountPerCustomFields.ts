import {useMemo} from 'react'
import _zip from 'lodash/zip'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
} from 'hooks/reporting/useTimeSeries'
import {
    BREAKDOWN_FIELD,
    selectTimeSeriesWithBreakdown,
    TicketCustomFieldsTicketCountTimeSeriesData,
    TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile,
    VALUE_FIELD,
} from 'hooks/reporting/withBreakdown'
import useAppSelector from 'hooks/useAppSelector'
import {WithChildren} from 'pages/common/components/table/TableBodyRowExpandable'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {
    getCustomFieldsOrder,
    TicketInsightsOrder,
} from 'state/ui/stats/ticketInsightsSlice'
import {getFilterDateRange} from 'utils/reporting'
import {notUndefined} from 'utils/types'

const breakdownTimeSeries = (
    timeSeriesData: Record<string, TimeSeriesDataItem[][]>,
    order: TicketInsightsOrder
): WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[] => {
    const timeSeriesObjects = Object.keys(timeSeriesData).map((key) => ({
        [BREAKDOWN_FIELD]: key,
        timeSeries: timeSeriesData[key][0],
    }))

    return selectTimeSeriesWithBreakdown(timeSeriesObjects, order)
}

export const useCustomFieldsTicketCountPerCustomFields = (
    selectedCustomFieldId: number
): {
    data: WithChildren<TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile>[]
    dateTimes: string[]
    isLoading: boolean
    order: TicketInsightsOrder
} => {
    const {cleanStatsFilters, userTimezone, granularity} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const order = useAppSelector(getCustomFieldsOrder)
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters),
        granularity
    )
    const {data: timeSeriesData, isLoading} =
        useCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            String(selectedCustomFieldId)
        )

    const data = useMemo(
        () =>
            timeSeriesData !== undefined
                ? enrichWithPercentagesAndDeciles(
                      breakdownTimeSeries(timeSeriesData, order)
                  )
                : [],
        [timeSeriesData, order]
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
    totalsSum?: number,
    topLevelTimeSeriesSums?: TimeSeriesDataItem[],
    totalsMax?: number
): WithChildren<TicketCustomFieldsTicketCountTimeSeriesDataWithPercentageAndDecile>[] {
    const currentLevelTotalSum =
        totalsSum ||
        data.reduce(
            (acc, currentValue) => acc + (currentValue[VALUE_FIELD] || 0),
            0
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
                Math.max(...item.timeSeries.map((item) => item.value))
            )
        )

    return data.map((item) => ({
        ...item,
        percentage: ((item[VALUE_FIELD] || 0) / currentLevelTotalSum) * 100,
        decile: calculateDecile(item[VALUE_FIELD], currentLevelTotalSum),
        totalsDecile: calculateDecile(item[VALUE_FIELD], currentLevelMax),
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
            currentLevelTotalSum,
            sums,
            currentLevelMax
        ),
    }))
}

export const calculateDecile = (value: number | undefined, sum: number) =>
    sum !== 0 ? Math.min(Math.round(((value || 0) / sum) * 10), 9) : 0
