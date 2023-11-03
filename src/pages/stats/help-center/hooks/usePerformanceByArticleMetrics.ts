import {useMemo} from 'react'

import {
    performanceByArticleCountQueryFactory,
    performanceByArticleQueryFactory,
} from 'models/reporting/queryFactories/help-center/performanceByArticle'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {useMetric} from 'hooks/reporting/useMetric'
import {StatsFilters} from 'models/stat/types'
import {
    HelpCenterTableCell,
    TableCellType,
} from '../components/HelpCenterStatsTable/HelpCenterStatsTable'
import {getArticleUrl} from '../../../settings/helpCenter/utils/helpCenter.utils'

export const usePerformanceByArticleMetrics = ({
    itemPerPage,
    currentPage,
    statsFilters,
    timezone,
    helpCenterDomain,
}: {
    itemPerPage: number
    currentPage: number
    statsFilters: StatsFilters
    timezone: string
    helpCenterDomain: string
}) => {
    const articleViewData = useMetricPerDimension({
        ...performanceByArticleQueryFactory(statsFilters, timezone),
        limit: itemPerPage,
        offset: itemPerPage * (currentPage - 1),
    })
    const articleCountMetric = useMetric(
        performanceByArticleCountQueryFactory(statsFilters, timezone)
    )

    const total = articleCountMetric.data?.value ?? 0

    const data: HelpCenterTableCell[][] = useMemo(
        () =>
            articleViewData.data?.allData.map((value) => {
                const articleTitle =
                    typeof value[
                        HelpCenterTrackingEventDimensions.ArticleTitle
                    ] === 'string'
                        ? value[HelpCenterTrackingEventDimensions.ArticleTitle]
                        : null
                const articleSlug =
                    value[HelpCenterTrackingEventDimensions.ArticleSlug]
                const articleId = Number(
                    value[HelpCenterTrackingEventDimensions.ArticleId]
                )
                const localeCode =
                    value[HelpCenterTrackingEventDimensions.LocaleCode]
                const articleLink =
                    articleSlug && localeCode
                        ? getArticleUrl({
                              domain: helpCenterDomain,
                              slug: articleSlug,
                              locale: localeCode,
                              isUnlisted: false,
                              articleId: articleId,
                              unlistedId: '', // We don't handle unlisted articles
                          })
                        : null
                const articleViewCount = Number(
                    value[HelpCenterTrackingEventMeasures.ArticleView]
                )
                const articleLastUpdated =
                    value[
                        HelpCenterTrackingEventDimensions.ArticleLastUpdated
                    ] ?? null

                return [
                    {
                        type: TableCellType.String,
                        value: articleTitle,
                        link: articleLink,
                    },
                    {
                        type: TableCellType.Number,
                        value: isNaN(articleViewCount)
                            ? null
                            : articleViewCount,
                    },
                    {
                        type: TableCellType.Percent,
                        value: null,
                    },
                    {
                        type: TableCellType.String,
                        value: null,
                    },
                    {
                        type: TableCellType.Date,
                        value: articleLastUpdated,
                    },
                ]
            }) ?? [[]],
        [articleViewData.data?.allData, helpCenterDomain]
    )

    return useMemo(
        () => ({
            data,
            total,
            isLoading:
                articleCountMetric.isFetching || articleViewData.isFetching,
        }),
        [data, total, articleCountMetric.isFetching, articleViewData.isFetching]
    )
}
