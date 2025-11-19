import { useMemo } from 'react'

import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { searchQueryClicksQueryFactory } from 'domains/reporting/models/queryFactories/help-center/searchResult'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { HelpCenterTableCell } from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { TableCellType } from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { getArticleUrl } from 'domains/reporting/pages/help-center/utils/helpcenterStats.utils'

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
    const searchQueryData = useMetricPerDimension<string>(
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
