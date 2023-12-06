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
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {notEmpty} from 'utils'
import {
    HelpCenterTableCell,
    TableCellType,
} from '../components/HelpCenterStatsTable/HelpCenterStatsTable'
import {getArticleUrl} from '../utils/helpcenterStats.utils'

export const usePerformanceByArticleMetrics = ({
    itemPerPage,
    currentPage,
    statsFilters,
    timezone,
    helpCenterDomain,
    helpCenterId,
}: {
    itemPerPage: number
    currentPage: number
    statsFilters: StatsFilters
    timezone: string
    helpCenterDomain: string
    helpCenterId: number
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

    const articleIds = articleViewData.data?.allData
        .map((data) => {
            const id = Number(data[HelpCenterTrackingEventDimensions.ArticleId])

            return isNaN(id) ? null : id
        })
        .filter(notEmpty)

    const {data: helpCenterArticlesData} = useGetHelpCenterArticleList(
        helpCenterId,
        {
            version_status: 'latest_draft',
            page: currentPage,
            per_page: itemPerPage,
            ids: articleIds,
        },
        {
            enabled: articleIds !== undefined,
        }
    )

    const helpCenterArticles = helpCenterArticlesData?.data

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
                          })
                        : null
                const articleViewCount = Number(
                    value[HelpCenterTrackingEventMeasures.ArticleView]
                )

                const helpCenterArticle = helpCenterArticles?.find(
                    (article) => article.id === articleId
                )
                const ratingRate = helpCenterArticle
                    ? (helpCenterArticle.rating.up /
                          (helpCenterArticle.rating.up +
                              helpCenterArticle.rating.down)) *
                      100
                    : null
                const rating = helpCenterArticle
                    ? `${helpCenterArticle.rating.up} | ${helpCenterArticle.rating.down}`
                    : null

                const articleLastUpdated =
                    helpCenterArticle?.updated_datetime ?? null

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
                        value: ratingRate,
                    },
                    {
                        type: TableCellType.String,
                        value: rating,
                    },
                    {
                        type: TableCellType.Date,
                        value: articleLastUpdated,
                    },
                ]
            }) ?? [],
        [articleViewData.data?.allData, helpCenterArticles, helpCenterDomain]
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
