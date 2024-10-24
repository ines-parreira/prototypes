import {useMemo} from 'react'

import {useMetric} from 'hooks/reporting/useMetric'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {
    searchResultQueryCountFactory,
    searchResultTermsQueryFactory,
} from 'models/reporting/queryFactories/help-center/searchResult'
import {StatsFilters} from 'models/stat/types'

import {
    HelpCenterTableCell,
    TableCellType,
} from '../components/HelpCenterStatsTable/HelpCenterStatsTable'

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
        searchResultQueryCountFactory(statsFilters, timezone)
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
                    ]
                )
                const articlesClicked = Number(
                    value[
                        HelpCenterTrackingEventMeasures
                            .SearchArticlesClickedCount
                    ]
                )

                const articlesClickedUnique = Number(
                    value[
                        HelpCenterTrackingEventMeasures
                            .SearchArticlesClickedCountUnique
                    ]
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
                                          articlesClickedUnique
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
        [onModalOpen, searchResultTerms.data?.allData]
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
        ]
    )
}
