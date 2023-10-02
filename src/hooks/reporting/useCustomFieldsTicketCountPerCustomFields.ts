import {useMemo} from 'react'
import {OrderDirection} from 'models/api/types'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
} from 'hooks/reporting/useTimeSeries'
import {
    BREAKDOWN_FIELD,
    selectTimeSeriesWithBreakdown,
    TicketCustomFieldsTicketCountTimeSeriesData,
} from 'hooks/reporting/withBreakdown'
import useAppSelector from 'hooks/useAppSelector'
import {WithChildren} from 'pages/common/components/table/TableBodyRowExpandable'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {getCustomFieldsOrder} from 'state/ui/stats/ticketInsightsSlice'
import {getFilterDateRange} from 'utils/reporting'

export const useCustomFieldsTicketCountPerCustomFields = (
    selectedCustomFieldId: number
): {
    data: WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[]
    dateTimes: string[]
    isLoading: boolean
    order: OrderDirection
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
                ? breakdownTimeSeries(timeSeriesData, order)
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

function breakdownTimeSeries(
    timeSeriesData: Record<string, TimeSeriesDataItem[][]>,
    order: OrderDirection
): WithChildren<TicketCustomFieldsTicketCountTimeSeriesData>[] {
    const timeSeriesObjects = Object.keys(timeSeriesData).map((key) => ({
        [BREAKDOWN_FIELD]: key,
        timeSeries: timeSeriesData[key][0],
    }))

    return selectTimeSeriesWithBreakdown(timeSeriesObjects, order)
}
