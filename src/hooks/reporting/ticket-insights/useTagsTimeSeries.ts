import { useMemo } from 'react'

import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'

import { Tag } from '@gorgias/helpdesk-queries'

import { useTagSearch } from 'hooks/reporting/common/useTagSearch'
import { getTagValuesByOperator } from 'hooks/reporting/helpers'
import { useTagsTicketCount } from 'hooks/reporting/metricsPerPeriod'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import {
    TagSelection,
    useTagResultsSelection,
} from 'hooks/reporting/tags/useTagResultsSelection'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import { useTagsTicketCountTimeSeries } from 'hooks/reporting/timeSeries'
import { MetricPerDimensionTrend } from 'hooks/reporting/useMetricPerDimension'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { OrderDirection } from 'models/api/types'
import { TicketTagsEnrichedMember } from 'models/reporting/cubes/TicketTagsEnrichedCube'
import { StatsFilters } from 'models/stat/types'
import { getTagName } from 'pages/stats/ticket-insights/tags/helpers'

const DATASET_VISIBILITY_ITEMS = 3

const getSortedData = (
    data: Record<string, TimeSeriesDataItem[][]>,
    tagsTicketCount: MetricPerDimensionTrend,
    tags: Tag[],
    topAmount: number,
) => {
    const getTagById = (id: string) =>
        getTagName({ name: tags.find((t) => String(t.id) === id)?.name, id })

    const sortingOrder = tagsTicketCount.data?.value.map(
        (v) => v[TicketTagsEnrichedMember.TagId],
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
