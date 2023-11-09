import {useMemo} from 'react'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {StatsFilters} from 'models/stat/types'
import {searchQueryClicksQueryFactory} from 'models/reporting/queryFactories/help-center/searchResult'
import {
    HelpCenterTableCell,
    TableCellType,
} from '../components/HelpCenterStatsTable/HelpCenterStatsTable'

export const useSearchQueryMetrics = ({
    searchQuery,
    statsFilters,
    timezone,
}: {
    statsFilters: StatsFilters
    timezone: string
    searchQuery: string
}) => {
    const searchQueryData = useMetricPerDimension(
        searchQueryClicksQueryFactory(statsFilters, timezone, [searchQuery])
    )

    const data: HelpCenterTableCell[][] = useMemo(
        () =>
            searchQueryData.data?.allData.map((value) => {
                const articleTitle =
                    value[HelpCenterTrackingEventDimensions.ArticleTitle]
                const clicks = Number(
                    value[
                        HelpCenterTrackingEventMeasures
                            .SearchArticlesClickedCount
                    ]
                )

                return [
                    {
                        type: TableCellType.String,
                        value: articleTitle ?? null,
                    },
                    {
                        type: TableCellType.Number,
                        value: isNaN(clicks) ? null : clicks,
                    },
                ]
            }) ?? [[]],
        [searchQueryData.data?.allData]
    )

    return useMemo(
        () => ({
            data,
            isLoading: searchQueryData.isFetching,
        }),
        [data, searchQueryData.isFetching]
    )
}
