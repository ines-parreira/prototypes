import { useMemo } from 'react'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import {
    noSearchResultsCountQueryFactory,
    noSearchResultsQueryFactory,
} from 'domains/reporting/models/queryFactories/help-center/searchResult'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    HelpCenterTableCell,
    TableCellType,
} from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'

export const useNoSearchResultsMetrics = ({
    statsFilters,
    timezone,
    itemPerPage,
    currentPage,
}: {
    statsFilters: StatsFilters
    timezone: string
    currentPage: number
    itemPerPage: number
}) => {
    const noSearchResults = useMetricPerDimension({
        ...noSearchResultsQueryFactory(statsFilters, timezone),
        limit: itemPerPage,
        offset: itemPerPage * (currentPage - 1),
    })
    // P2/P3
    const noSearchResultCount = useMetric(
        noSearchResultsCountQueryFactory(statsFilters, timezone),
    )

    const total = noSearchResultCount.data?.value ?? 0

    const data: HelpCenterTableCell[][] = useMemo(
        () =>
            noSearchResults.data?.allData.map((value) => {
                const searchTerm =
                    typeof value[
                        HelpCenterTrackingEventDimensions.SearchQuery
                    ] === 'string'
                        ? value[HelpCenterTrackingEventDimensions.SearchQuery]
                        : null
                const searchCount = Number(
                    value[
                        HelpCenterTrackingEventMeasures
                            .SearchRequestedQueryCount
                    ],
                )

                return [
                    {
                        type: TableCellType.String,
                        value: searchTerm,
                    },
                    {
                        type: TableCellType.Number,
                        value: isNaN(searchCount) ? null : searchCount,
                    },
                ]
            }) ?? [],
        [noSearchResults.data?.allData],
    )

    return useMemo(
        () => ({
            data,
            total,
            isLoading:
                noSearchResults.isFetching || noSearchResultCount.isFetching,
        }),
        [
            data,
            total,
            noSearchResults.isFetching,
            noSearchResultCount.isFetching,
        ],
    )
}
