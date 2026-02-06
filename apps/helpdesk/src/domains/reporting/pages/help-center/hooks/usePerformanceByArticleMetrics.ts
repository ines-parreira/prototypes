import { useMemo } from 'react'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import {
    performanceByArticleCountQueryFactory,
    performanceByArticleQueryFactory,
} from 'domains/reporting/models/queryFactories/help-center/performanceByArticle'
import {
    helpCenterPerformancePerArticleCountQueryFactoryV2,
    helpCenterPerformancePerArticleQueryFactoryV2,
} from 'domains/reporting/models/scopes/helpCenter'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { HelpCenterTableCell } from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { TableCellType } from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { getArticleUrl } from 'domains/reporting/pages/help-center/utils/helpcenterStats.utils'
import { useGetHelpCenterArticleList } from 'models/helpCenter/queries'
import { notEmpty } from 'utils'

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
    const articleViewData = useMetricPerDimensionV2(
        {
            ...performanceByArticleQueryFactory(statsFilters, timezone),
            limit: itemPerPage,
            offset: itemPerPage * (currentPage - 1),
        },
        helpCenterPerformancePerArticleQueryFactoryV2({
            filters: statsFilters,
            timezone,
            limit: itemPerPage,
            offset: itemPerPage * (currentPage - 1),
        }),
    )
    // P2/P3
    const articleCountMetric = useMetric(
        performanceByArticleCountQueryFactory(statsFilters, timezone),
        helpCenterPerformancePerArticleCountQueryFactoryV2({
            filters: statsFilters,
            timezone,
        }),
    )

    const total = articleCountMetric.data?.value ?? 0

    const articleIds = articleViewData.data?.allData
        .map((data) => {
            const id = Number(data[HelpCenterTrackingEventDimensions.ArticleId])

            return isNaN(id) ? null : id
        })
        .filter(notEmpty)

    const { data: helpCenterArticlesData } = useGetHelpCenterArticleList(
        helpCenterId,
        {
            version_status: 'latest_draft',
            ids: articleIds,
        },
        {
            enabled: articleIds !== undefined,
        },
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
                    value[HelpCenterTrackingEventDimensions.ArticleId],
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
                    value[HelpCenterTrackingEventMeasures.ArticleView],
                )

                const helpCenterArticle = helpCenterArticles?.find(
                    (article) => article.id === articleId,
                )

                const articleTranslation = helpCenterArticle?.translation

                let ratingRate = null
                if (helpCenterArticle) {
                    const rate =
                        (helpCenterArticle.rating.up /
                            (helpCenterArticle.rating.up +
                                helpCenterArticle.rating.down)) *
                        100

                    ratingRate = isNaN(rate) ? null : Math.round(rate)
                }

                const rating = helpCenterArticle
                    ? `${helpCenterArticle.rating.up} | ${helpCenterArticle.rating.down}`
                    : null

                const articleLastUpdated =
                    articleTranslation?.updated_datetime ??
                    helpCenterArticle?.updated_datetime ??
                    null

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
        [articleViewData.data?.allData, helpCenterArticles, helpCenterDomain],
    )

    return useMemo(
        () => ({
            data,
            total,
            isLoading:
                articleCountMetric.isFetching || articleViewData.isFetching,
        }),
        [
            data,
            total,
            articleCountMetric.isFetching,
            articleViewData.isFetching,
        ],
    )
}
