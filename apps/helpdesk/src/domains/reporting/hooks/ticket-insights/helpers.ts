import { orderBy } from 'lodash'

import { Tag } from '@gorgias/helpdesk-queries'

import { getTagValuesByOperator } from 'domains/reporting/hooks/helpers'
import { TagSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import {
    TimeSeriesDataItem,
    TimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagsTableOrder } from 'domains/reporting/state/ui/stats/tagsReportSlice'

export const getTagName = ({
    name,
    id,
}: {
    name?: string
    id: string
}): string => {
    return name || `${id} (deleted)`
}

type TagTimeSeriesItem = {
    tagId: string
    tag?: Tag
    total: number
    timeSeries: TimeSeriesDataItem[]
}

const formatTimeSeriesPerDimension = (
    timeSeriesData: TimeSeriesPerDimension,
    tags: Record<string, Tag | undefined>,
): TagTimeSeriesItem[] =>
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
            return (data: TagTimeSeriesItem[]) =>
                orderBy(
                    data,
                    (item: TagTimeSeriesItem) =>
                        getTagName({ name: item.tag?.name, id: item.tagId }),
                    order.direction,
                )
        case 'total':
            return (data: TagTimeSeriesItem[]) =>
                orderBy(
                    data,
                    (item: TagTimeSeriesItem) => item.total,
                    order.direction,
                )
        default:
            return (data: TagTimeSeriesItem[]) =>
                orderBy(
                    data,
                    (item: TagTimeSeriesItem) =>
                        item.timeSeries[orderColumn]?.value,
                    order.direction,
                )
    }
}

export const formatAndOrderTagTimeSeries = (
    timeSeriesData: TimeSeriesPerDimension | undefined,
    {
        tags,
        tagsTableOrder,
    }: {
        tags: Record<string, Tag | undefined>
        tagsTableOrder: TagsTableOrder
    },
) => {
    return timeSeriesData
        ? getOrderBy(tagsTableOrder)(
              formatTimeSeriesPerDimension(timeSeriesData, tags),
          )
        : []
}

export const getTagWiseTicketTotals = (data: TagTimeSeriesItem[]) => {
    const grandTotal = data.reduce((sum, item) => sum + item.total, 0)

    const columnTotals = data.reduce<number[]>((totals, item) => {
        item.timeSeries.forEach(
            (dataPoint, index) =>
                (totals[index] = dataPoint.value + (totals[index] ?? 0)),
        )
        return totals
    }, [])

    return {
        columnTotals,
        grandTotal,
    }
}

export const getOverallTicketTotals = (
    timeSeriesData: TimeSeriesDataItem[],
) => {
    const columnTotals = timeSeriesData.map((item) => item.value)

    const grandTotal = columnTotals.reduce((sum, item) => sum + item, 0)

    return {
        columnTotals,
        grandTotal,
    }
}

export const filterTimeDataWithSelectedTags = ({
    data,
    statsFilters,
    tagResultsSelection,
}: {
    data: TagTimeSeriesItem[]
    statsFilters: StatsFilters
    tagResultsSelection: TagSelection
}) => {
    const selectedTags = getTagValuesByOperator(statsFilters)

    if (
        tagResultsSelection === TagSelection.includeTags ||
        selectedTags.length === 0
    ) {
        return data
    }

    return data.reduce<TagTimeSeriesItem[]>((acc, item) => {
        if (selectedTags.includes(Number(item.tagId))) {
            acc.push(item)
        }
        return acc
    }, [])
}
