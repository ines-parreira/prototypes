import { useMemo } from 'react'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import {
    searchResultQueryCountFactory,
    searchResultTermsQueryFactory,
} from 'domains/reporting/models/queryFactories/help-center/searchResult'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    HelpCenterTableCell,
    TableCellType,
} from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'

export const useSearchTermsMetrics = ({
    statsFilters,
    timezone,
    itemPerPage,
    currentPage,
    onModalOpen,
}: {
    statsFilters: StatsFilters
    timezone: string
    currentPage: number
    itemPerPage: number
    onModalOpen: (searchQuery: string, articleClickedCount: number) => void
}) => {
    const searchResultTerms = useMetricPerDimension({
        ...searchResultTermsQueryFactory(statsFilters, timezone),
        limit: itemPerPage,
        offset: itemPerPage * (currentPage - 1),
    })
    const searchResultCount = useMetric(
        searchResultQueryCountFactory(statsFilters, timezone),
    )

    const total = searchResultCount.data?.value ?? 0

    const data: HelpCenterTableCell[][] = useMemo(
        () =>
            searchResultTerms.data?.allData.map((value) => {
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
                const articlesClicked = Number(
                    value[
                        HelpCenterTrackingEventMeasures
                            .SearchArticlesClickedCount
                    ],
                )

                const articlesClickedUnique = Number(
                    value[
                        HelpCenterTrackingEventMeasures
                            .SearchArticlesClickedCountUnique
                    ],
                )

                const clickThroughRate = (articlesClicked / searchCount) * 100

                return [
                    {
                        type: TableCellType.String,
                        value: searchTerm,
                    },
                    {
                        type: TableCellType.Number,
                        value: isNaN(searchCount) ? null : searchCount,
                    },
                    {
                        type: TableCellType.Number,
                        value: isNaN(articlesClicked) ? null : articlesClicked,
                        onClick:
                            searchTerm && articlesClickedUnique > 0
                                ? () =>
                                      onModalOpen(
                                          searchTerm,
                                          articlesClickedUnique,
                                      )
                                : undefined,
                    },
                    {
                        type: TableCellType.Percent,
                        value: isNaN(clickThroughRate)
                            ? null
                            : clickThroughRate,
                    },
                ]
            }) ?? [],
        [onModalOpen, searchResultTerms.data?.allData],
    )

    return useMemo(
        () => ({
            data,
            total,
            isLoading:
                searchResultTerms.isFetching || searchResultCount.isFetching,
        }),
        [
            data,
            total,
            searchResultTerms.isFetching,
            searchResultCount.isFetching,
        ],
    )
}
