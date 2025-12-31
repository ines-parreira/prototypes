import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { performanceByArticleQueryFactory } from 'domains/reporting/models/queryFactories/help-center/performanceByArticle'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useAppSelector from 'hooks/useAppSelector'
import { useGetHelpCenterStatistics } from 'models/helpCenter/queries'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import { getTimezone } from 'state/currentUser/selectors'

export type ArticleEngagementData = {
    views?: number
    rating?: number
    reactions?: {
        up: number
        down: number
    }
    isLoading: boolean
}

export const useArticleEngagementFromContext = ():
    | ArticleEngagementData
    | undefined => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    const helpCenterId = helpCenter.id
    const articleId = state.article?.id

    const shouldFetchData = isPerformanceStatsEnabled && !!articleId

    const dateRange = useMemo(() => {
        const now = new Date()
        const past28Days = new Date(now)
        past28Days.setDate(now.getDate() - 28)

        return {
            start_date: past28Days.toISOString(),
            end_date: now.toISOString(),
        }
    }, [])

    const { data: statisticsData, isFetching: isFetchingStatistics } =
        useGetHelpCenterStatistics(
            helpCenterId,
            {
                ...dateRange,
                ids: articleId ? [articleId] : [],
            },
            {
                enabled: shouldFetchData,
            },
        )

    const articleStatistics = useMemo(
        () => statisticsData?.[0],
        [statisticsData],
    )

    const statsFilters = useMemo(() => {
        const now = new Date()
        const past28Days = new Date(now)
        past28Days.setDate(now.getDate() - 28)

        return {
            helpCenters: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [helpCenterId],
            },
            period: {
                start_datetime: past28Days.toISOString(),
                end_datetime: now.toISOString(),
            },
        }
    }, [helpCenterId])

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

    const articleViewData = useMetricPerDimension<string>(
        query,
        undefined,
        shouldFetchData,
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

    if (!shouldFetchData) {
        return undefined
    }

    return {
        views,
        rating,
        reactions,
        isLoading: articleViewData.isFetching || isFetchingStatistics,
    }
}
