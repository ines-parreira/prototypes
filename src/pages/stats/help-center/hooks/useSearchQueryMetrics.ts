import { useMemo } from 'react'

import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import { searchQueryClicksQueryFactory } from 'models/reporting/queryFactories/help-center/searchResult'
import { StatsFilters } from 'models/stat/types'

import {
    HelpCenterTableCell,
    TableCellType,
} from '../components/HelpCenterStatsTable/HelpCenterStatsTable'
import { getArticleUrl } from '../utils/helpcenterStats.utils'

export const useSearchQueryMetrics = ({
    searchQuery,
    statsFilters,
    timezone,
    helpCenterDomain,
}: {
    statsFilters: StatsFilters
    timezone: string
    searchQuery: string
    helpCenterDomain: string
}) => {
    const searchQueryData = useMetricPerDimension(
        searchQueryClicksQueryFactory(statsFilters, timezone, [searchQuery]),
    )

    const data: HelpCenterTableCell[][] = useMemo(
        () =>
            searchQueryData.data?.allData.map((value) => {
                const articleTitle =
                    value[HelpCenterTrackingEventDimensions.ArticleTitle]
                const articleSlug =
                    value[HelpCenterTrackingEventDimensions.ArticleSlug]
                const localeCode =
                    value[HelpCenterTrackingEventDimensions.LocaleCode]
                const articleLink =
                    articleSlug && localeCode
                        ? getArticleUrl({
                              domain: helpCenterDomain,
                              slug: articleSlug,
                              locale: localeCode,
                          })
                        : null

                const clicks = Number(
                    value[
                        HelpCenterTrackingEventMeasures
                            .SearchArticlesClickedCount
                    ],
                )

                return [
                    {
                        type: TableCellType.String,
                        value: articleTitle ?? null,
                        link: articleLink,
                    },
                    {
                        type: TableCellType.Number,
                        value: isNaN(clicks) ? null : clicks,
                    },
                ]
            }) ?? [],
        [helpCenterDomain, searchQueryData.data?.allData],
    )

    return useMemo(
        () => ({
            data,
            isLoading: searchQueryData.isFetching,
        }),
        [data, searchQueryData.isFetching],
    )
}
