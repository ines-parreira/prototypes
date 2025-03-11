import { orderBy } from 'lodash'

import { Tag } from '@gorgias/api-queries'

import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { useTagsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
    TimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getTagName } from 'pages/stats/ticket-insights/tags/helpers'
import { getEntitiesTags } from 'state/entities/tags/selectors'
import {
    getTagsOrder,
    setOrder,
    TagsTableOrder,
} from 'state/ui/stats/tagsReportSlice'
import { getFilterDateRange } from 'utils/reporting'

export type FormattedDataItem = {
    tagId: string
    tag?: Tag
    total: number
    timeSeries: TimeSeriesDataItem[]
}

const formatTimeSeriesPerDimension = (
    timeSeriesData: TimeSeriesPerDimension,
    tags: Record<string, Tag | undefined>,
): FormattedDataItem[] =>
    Object.entries(timeSeriesData).map(([key, value]) => ({
        tagId: key,
        tag: tags[key],
        total: (value[0] ?? []).reduce((sum, item) => sum + item.value, 0),
        timeSeries: value[0] ?? [],
    }))

const getOrderBy = (order: TagsTableOrder) => {
    const orderColumn = order.column
    switch (orderColumn) {
        case 'tag':
            return (data: FormattedDataItem[]) =>
                orderBy(
                    data,
                    (item: FormattedDataItem) =>
                        getTagName({ name: item.tag?.name, id: item.tagId }),
                    order.direction,
                )
        case 'total':
            return (data: FormattedDataItem[]) =>
                orderBy(
                    data,
                    (item: FormattedDataItem) => item.total,
                    order.direction,
                )
        default:
            return (data: FormattedDataItem[]) =>
                orderBy(
                    data,
                    (item: FormattedDataItem) =>
                        item.timeSeries[orderColumn]?.value,
                    order.direction,
                )
    }
}

export const getFormattedDataWithTotals = (
    timeSeriesData: TimeSeriesPerDimension | undefined,
    tags: Record<string, Tag | undefined>,
    order: TagsTableOrder,
) => {
    const timeData = timeSeriesData
        ? getOrderBy(order)(formatTimeSeriesPerDimension(timeSeriesData, tags))
        : []

    const grandTotal = timeData.reduce((sum, item) => sum + item.total, 0)
    const columnTotals = timeData.reduce<number[]>((totals, item) => {
        item.timeSeries.forEach(
            (dataPoint, index) =>
                (totals[index] = dataPoint.value + (totals[index] ?? 0)),
        )
        return totals
    }, [])

    return {
        data: timeData,
        grandTotal,
        columnTotals,
    }
}

export const useTicketCountPerTag = () => {
    const dispatch = useAppDispatch()
    const order = useAppSelector(getTagsOrder)
    const { cleanStatsFilters, userTimezone, granularity } =
        useNewStatsFilters()
    const tags = useAppSelector(getEntitiesTags)
    const { data: timeSeriesData, isLoading } = useTagsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters.period),
        granularity,
    )

    const timeData = getFormattedDataWithTotals(timeSeriesData, tags, order)

    const setOrdering = (column: 'tag' | 'total' | number) => {
        dispatch(setOrder({ column }))
    }

    return {
        data: timeData.data,
        grandTotal: timeData.grandTotal,
        columnTotals: timeData.columnTotals,
        dateTimes,
        isLoading,
        order,
        setOrdering,
        cleanStatsFilters,
        granularity,
    }
}
