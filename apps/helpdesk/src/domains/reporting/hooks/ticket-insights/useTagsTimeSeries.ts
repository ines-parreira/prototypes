import { useMemo } from 'react'

import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'

import type { Tag } from '@gorgias/helpdesk-queries'

import { useTagSearch } from 'domains/reporting/hooks/common/useTagSearch'
import { getTagValuesByOperator } from 'domains/reporting/hooks/helpers'
import { useTagsTicketCount } from 'domains/reporting/hooks/metricsPerPeriod'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    TagSelection,
    useTagResultsSelection,
} from 'domains/reporting/hooks/tags/useTagResultsSelection'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import { useTagsTicketCountTimeSeries } from 'domains/reporting/hooks/timeSeries'
import type { MetricPerDimensionTrend } from 'domains/reporting/hooks/useMetricPerDimension'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { TicketTagsEnrichedMember } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getTagName } from 'domains/reporting/pages/ticket-insights/tags/helpers'
import { OrderDirection } from 'models/api/types'

const DATASET_VISIBILITY_ITEMS = 3

const getSortedData = (
    data: Record<string, TimeSeriesDataItem[][]>,
    tagsTicketCount: MetricPerDimensionTrend,
    tags: Tag[],
    topAmount: number,
) => {
    const getTagById = (id: string | number) =>
        getTagName({
            name: tags.find((t) => String(t.id) === String(id))?.name,
            id,
        })

    const sortingOrder = tagsTicketCount.data?.value.map((v) =>
        String(v['tagId' in v ? 'tagId' : TicketTagsEnrichedMember.TagId]),
    )
    const sortedData = _sortBy(Object.entries(data), ([key]) =>
        sortingOrder.indexOf(key),
    )

    const topData = sortedData.slice(0, topAmount)

    const dataToRender = topData.map(([__, data]) => data[0])
    const labels = topData
        .map(([tagId, __]) => tagId)
        .map((tagId) => getTagById(tagId))

    const tooltips = topData
        .map(([tagId, __]) => tagId)
        .map((tagId) => getTagById(tagId))

    const initialVisibility = _fromPairs(
        topData.map((_, index) => [index, index < DATASET_VISIBILITY_ITEMS]),
    )

    return { dataToRender, labels, tooltips, initialVisibility }
}

export const filterTimeSeriesWithSelectedTags = ({
    data,
    statsFilters,
    tagResultsSelection,
}: {
    data: Record<string, TimeSeriesDataItem[][]>
    statsFilters: StatsFilters
    tagResultsSelection: TagSelection
}) => {
    const tags = getTagValuesByOperator(statsFilters)

    if (tagResultsSelection === TagSelection.includeTags || tags.length === 0) {
        return data
    }

    return Object.entries(data).reduce<Record<string, TimeSeriesDataItem[][]>>(
        (acc, [key, value]) => {
            if (tags.includes(Number(key))) {
                acc[key] = value
            }
            return acc
        },
        {},
    )
}

export const useTagsTimeSeries = (topAmount = 10) => {
    const { tagsState } = useTagSearch()
    const [tagResultsSelection] = useTagResultsSelection()

    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const tags: Tag[] = useMemo(() => {
        return Object.keys(tagsState).map(
            (tagId) => tagsState[tagId.toString()],
        )
    }, [tagsState])

    const [tagTicketTimeReference] = useTicketTimeReference(Entity.Tag)

    const { data: tagsTicketCountTimeSeriesData = {}, isFetching } =
        useTagsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            OrderDirection.Desc,
            tagTicketTimeReference,
        )

    const data = filterTimeSeriesWithSelectedTags({
        data: tagsTicketCountTimeSeriesData,
        statsFilters: cleanStatsFilters,
        tagResultsSelection,
    })

    const tagsTicketCount = useTagsTicketCount(
        cleanStatsFilters,
        userTimezone,
        OrderDirection.Desc,
    )

    const { dataToRender, labels, tooltips, initialVisibility } = useMemo(
        () => getSortedData(data, tagsTicketCount, tags, topAmount),
        [data, tagsTicketCount, tags, topAmount],
    )

    return {
        isFetching,
        granularity,
        data: dataToRender,
        legendInfo: {
            labels,
            tooltips,
        },
        legendDatasetVisibility: initialVisibility,
    }
}
