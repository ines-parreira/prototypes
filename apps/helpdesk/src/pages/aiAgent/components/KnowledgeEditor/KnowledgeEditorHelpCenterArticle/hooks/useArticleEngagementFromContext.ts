import { useMemo } from 'react'

import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { performanceByArticleQueryFactory } from 'domains/reporting/models/queryFactories/help-center/performanceByArticle'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { helpCenterPerformancePerArticleQueryFactoryV2 } from 'domains/reporting/models/scopes/helpCenter'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useAppSelector from 'hooks/useAppSelector'
import { useGetHelpCenterStatistics } from 'models/helpCenter/queries'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'
import { getTimezone } from 'state/currentUser/selectors'

export type ArticleEngagementData = {
    views?: number
    rating?: number
    reactions?: {
        up: number
        down: number
    }
    isLoading: boolean
    subtitle: string
}

export const useArticleEngagementFromContext = (): ArticleEngagementData => {
    const timezone = useAppSelector(getTimezone)
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    const helpCenterId = helpCenter.id
    const articleId = state.article?.id
    const impactDateRange = state.historicalVersion?.impactDateRange

    const dateRange = useMemo(() => {
        if (impactDateRange) {
            return {
                start_date: impactDateRange.start_datetime,
                end_date: impactDateRange.end_datetime,
            }
        }

        const now = new Date()
        const past28Days = new Date(now)
        past28Days.setDate(now.getDate() - 28)

        return {
            start_date: past28Days.toISOString(),
            end_date: now.toISOString(),
        }
    }, [impactDateRange])

    const { data: statisticsData, isFetching: isFetchingStatistics } =
        useGetHelpCenterStatistics(
            helpCenterId,
            {
                ...dateRange,
                ids: articleId ? [articleId] : [],
            },
            {
                enabled: !!articleId,
            },
        )

    const articleStatistics = useMemo(
        () => statisticsData?.[0],
        [statisticsData],
    )

    const statsFilters = useMemo(() => {
        let period: { start_datetime: string; end_datetime: string }

        if (impactDateRange) {
            period = {
                start_datetime: impactDateRange.start_datetime,
                end_datetime: impactDateRange.end_datetime,
            }
        } else {
            const now = new Date()
            const past28Days = new Date(now)
            past28Days.setDate(now.getDate() - 28)
            period = {
                start_datetime: past28Days.toISOString(),
                end_datetime: now.toISOString(),
            }
        }

        return {
            helpCenters: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [helpCenterId],
            },
            period,
        }
    }, [helpCenterId, impactDateRange])

    const query = useMemo(() => {
        const baseQuery = performanceByArticleQueryFactory(
            statsFilters,
            timezone ?? 'UTC',
        )

        return {
            ...baseQuery,
            filters: [
                ...baseQuery.filters,
                {
                    member: HelpCenterTrackingEventDimensions.ArticleId,
                    operator: ReportingFilterOperator.Equals,
                    values: [String(articleId)],
                },
            ],
        }
    }, [statsFilters, timezone, articleId])

    const articleViewData = useMetricPerDimensionV2(
        query,
        helpCenterPerformancePerArticleQueryFactoryV2({
            filters: {
                ...statsFilters,
                articleId: withLogicalOperator([String(articleId)]),
            },
            timezone: timezone ?? 'UTC',
        }),
        undefined,
        !!articleId,
    )

    const views = useMemo(() => {
        const articleData = articleViewData.data?.allData?.[0]
        if (!articleData) {
            return undefined
        }

        const viewCount =
            articleData[HelpCenterTrackingEventMeasures.ArticleView]
        return viewCount ? Number(viewCount) : undefined
    }, [articleViewData.data])

    const { rating, reactions } = useMemo(() => {
        const articleRating = articleStatistics?.rating
        if (!articleRating) {
            return { rating: undefined, reactions: undefined }
        }

        const { up, down } = articleRating
        const total = up + down

        return {
            rating: total > 0 ? up / total : undefined,
            reactions: {
                up,
                down,
            },
        }
    }, [articleStatistics?.rating])

    const subtitle = formatDateRangeSubtitle(impactDateRange)

    return {
        views,
        rating,
        reactions,
        isLoading: articleViewData.isFetching || isFetchingStatistics,
        subtitle,
    }
}
