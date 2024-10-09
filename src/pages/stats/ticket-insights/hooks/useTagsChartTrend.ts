import _flatten from 'lodash/flatten'
import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'
import {useCallback, useMemo} from 'react'
import {Tag} from '@gorgias/api-queries'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'

import {useTagsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {OrderDirection} from 'models/api/types'

import {useTagsTicketCount} from 'hooks/reporting/metricsPerAgent'
import {useTagSearch} from 'hooks/reporting/common/useTagSearch'
import {TicketTagsEnrichedMember} from 'models/reporting/cubes/TicketTagsEnrichedCube'

const DATASET_VISIBILITY_ITEMS = 3

export const useTagsTrend = (topAmount = 10) => {
    const {tagsState} = useTagSearch()
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

    const tags: Tag[] = useMemo(() => {
        return Object.keys(tagsState).map(
            (tagId) => tagsState[tagId.toString()]
        )
    }, [tagsState])

    const getTagById = useCallback(
        (id: string) => tags.find((t) => String(t.id) === id)?.name || id,
        [tags]
    )

    const {data = {}, isFetching} = useTagsTicketCountTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )

    const tagsTicketCount = useTagsTicketCount(
        cleanStatsFilters,
        userTimezone,
        OrderDirection.Desc
    )

    const sortedData = _fromPairs(
        _sortBy(Object.entries(data), ([key]) =>
            tagsTicketCount.data?.allData
                .map((v) => v[TicketTagsEnrichedMember.TagId])
                .indexOf(key)
        )
    )

    const topData = useMemo(
        () => _flatten(Object.values(sortedData)).slice(0, topAmount),
        [sortedData, topAmount]
    )

    return useMemo(
        () => ({
            isFetching,
            granularity,
            data: topData,
            legendInfo: {
                labels: Object.keys(sortedData)
                    .map((tagId) => getTagById(tagId))
                    .slice(0, topAmount),
                tooltips: Object.keys(sortedData).map((tagId) =>
                    getTagById(tagId)
                ),
            },
            legendDatasetVisibility: _fromPairs(
                topData.map((_, index) => [
                    index,
                    index < DATASET_VISIBILITY_ITEMS,
                ])
            ),
        }),
        [isFetching, granularity, topData, sortedData, topAmount, getTagById]
    )
}
