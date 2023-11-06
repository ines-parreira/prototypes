import {useMemo} from 'react'
import {StatsFilters} from 'models/stat/types'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    noSearchResultsCountQueryFactory,
    noSearchResultsQueryFactory,
} from 'models/reporting/queryFactories/help-center/searchResult'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {useMetric} from 'hooks/reporting/useMetric'
import {
    HelpCenterTableCell,
    TableCellType,
} from '../components/HelpCenterStatsTable/HelpCenterStatsTable'

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
    const noSearchResultCount = useMetric(
        noSearchResultsCountQueryFactory(statsFilters, timezone)
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
                    ]
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
            }) ?? [[]],
        [noSearchResults.data?.allData]
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
        ]
    )
}
