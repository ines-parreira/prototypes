import {Tag} from '@gorgias/api-queries'
import {orderBy} from 'lodash'
import {useState} from 'react'
import {useTagsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {
    getPeriodDateTimes,
    TimeSeriesDataItem,
    TimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import {opposite, OrderDirection} from 'models/api/types'
import {getEntitiesTags} from 'state/entities/tags/selectors'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'
import {getFilterDateRange} from 'utils/reporting'

type TagsTableOrder = {
    direction: OrderDirection
    column: 'tag' | 'total' | number
}

type FormattedDataItem = {
    tagId: string
    tag: Tag
    total: number
    timeSeries: TimeSeriesDataItem[]
}

const formatTimeSeriesPerDimension = (
    timeSeriesData: TimeSeriesPerDimension,
    tags: Record<string, Tag>
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
                    (item: FormattedDataItem) => item.tag.name,
                    order.direction
                )
        case 'total':
            return (data: FormattedDataItem[]) =>
                orderBy(
                    data,
                    (item: FormattedDataItem) => item.total,
                    order.direction
                )
        default:
            return (data: FormattedDataItem[]) =>
                orderBy(
                    data,
                    (item: FormattedDataItem) =>
                        item.timeSeries[orderColumn]?.value,
                    order.direction
                )
    }
}

export const useTicketCountPerTag = () => {
    const [order, setOrder] = useState<TagsTableOrder>({
        direction: OrderDirection.Asc,
        column: 'tag',
    })
    const {cleanStatsFilters, userTimezone, granularity} = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone
    )
    const tags = useAppSelector(getEntitiesTags)
    const {data: timeSeriesData, isLoading} = useTagsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )

    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters.period),
        granularity
    )
    const timeData = timeSeriesData
        ? getOrderBy(order)(formatTimeSeriesPerDimension(timeSeriesData, tags))
        : []

    const setOrdering = (column: 'tag' | 'total' | number) => {
        setOrder((prevState: TagsTableOrder) => {
            const defaultColumnDirection =
                column === 'tag' ? OrderDirection.Asc : OrderDirection.Desc
            return {
                direction:
                    prevState.column === column
                        ? opposite(prevState.direction)
                        : defaultColumnDirection,
                column: column,
            }
        })
    }

    return {
        data: timeData,
        dateTimes,
        isLoading,
        order,
        setOrdering,
    }
}
