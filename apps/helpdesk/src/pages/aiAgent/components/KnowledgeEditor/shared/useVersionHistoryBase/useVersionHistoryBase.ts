import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useInfiniteGetArticleTranslationVersions } from 'models/helpCenter/queries'
import type { Components } from 'rest_api/help_center_api/client.generated'

const VERSIONS_PER_PAGE = 20

export type ArticleTranslationVersion =
    Components.Schemas.ArticleTranslationVersionResponseDto

export type ImpactDateRange = {
    start_datetime: string
    end_datetime: string
}

export type VersionHistoryPayload = ArticleTranslationVersion & {
    impactDateRange: ImpactDateRange
}

export function formatDateRangeSubtitle(dateRange?: ImpactDateRange): string {
    if (!dateRange) return 'Last 28 days'

    const start = new Date(dateRange.start_datetime)
    const end = new Date(dateRange.end_datetime)

    const sameYear = start.getFullYear() === end.getFullYear()

    const monthDay: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
    }
    const monthDayYear: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }

    const startStr = start.toLocaleDateString(
        'en-US',
        sameYear ? monthDay : monthDayYear,
    )
    const endStr = end.toLocaleDateString('en-US', monthDayYear)

    return `${startStr} – ${endStr}`
}

export function getVersionImpactDateRange(
    versionId: number,
    versions: ArticleTranslationVersion[],
): ImpactDateRange {
    const currentIndex = versions.findIndex((v) => v.id === versionId)

    if (currentIndex === -1) {
        return getLast28DaysDateRange()
    }

    const currentVersion = versions[currentIndex]

    if (!currentVersion.published_datetime) {
        return getLast28DaysDateRange()
    }

    const nextVersion = currentIndex > 0 ? versions[currentIndex - 1] : null

    const startDatetime = currentVersion.published_datetime

    let endDate: Date

    if (nextVersion?.published_datetime) {
        endDate = new Date(nextVersion.published_datetime)
    } else {
        const now = new Date()
        now.setHours(now.getHours() + 1, 0, 0, 0)
        endDate = now
    }

    return {
        start_datetime: startDatetime,
        end_datetime: endDate.toISOString(),
    }
}

type HistoricalVersion = {
    versionId: number
} | null

type VersionHistoryDispatch = (
    action:
        | {
              type: 'VIEW_HISTORICAL_VERSION'
              payload: VersionHistoryPayload
          }
        | { type: 'CLEAR_HISTORICAL_VERSION' },
) => void

export type VersionHistoryBaseParams = {
    helpCenterId: number
    articleId: number
    locale: string
    currentVersionId: number | null
    historicalVersion: HistoricalVersion
    isUpdating: boolean
    isAutoSaving: boolean
    dispatch: VersionHistoryDispatch
}

export type VersionHistoryData = {
    versions: ArticleTranslationVersion[]
    isLoading: boolean
    isViewingHistoricalVersion: boolean
    currentVersionId: number | null
    selectedVersionId: number | null
    onSelectVersion: (version: ArticleTranslationVersion) => void
    onGoToLatest: () => void
    isDisabled: boolean
    hasNextPage: boolean
    isFetchingNextPage: boolean
    onLoadMore: () => void
    shouldLoadMore: boolean
}

export function useVersionHistoryBase({
    helpCenterId,
    articleId,
    locale,
    currentVersionId,
    historicalVersion,
    isUpdating,
    isAutoSaving,
    dispatch,
}: VersionHistoryBaseParams): VersionHistoryData {
    const isVersionHistoryEnabled = useFlag(
        FeatureFlagKey.AddVersionHistoryForArticlesAndGuidances,
    )

    const isEnabled =
        isVersionHistoryEnabled && !!helpCenterId && !!articleId && !!locale

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useInfiniteGetArticleTranslationVersions(
            {
                help_center_id: helpCenterId,
                article_id: articleId,
                locale,
            },
            { published: true, per_page: VERSIONS_PER_PAGE },
            {
                enabled: isEnabled,
            },
        )

    const versions = useMemo(
        () => data?.pages.flatMap((page) => page?.data ?? []) ?? [],
        [data],
    )

    const onLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const isViewingHistoricalVersion = historicalVersion !== null

    const selectedVersionId = historicalVersion?.versionId ?? null

    const isDisabled = isUpdating || isAutoSaving

    const onSelectVersion = useCallback(
        (version: ArticleTranslationVersion) => {
            if (isDisabled) return

            const isCurrentVersion =
                currentVersionId !== null && version.id === currentVersionId

            if (isCurrentVersion) {
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
            } else {
                const impactDateRange = getVersionImpactDateRange(
                    version.id,
                    versions,
                )
                dispatch({
                    type: 'VIEW_HISTORICAL_VERSION',
                    payload: { ...version, impactDateRange },
                })
            }
        },
        [dispatch, currentVersionId, isDisabled, versions],
    )

    const onGoToLatest = useCallback(() => {
        if (isDisabled) return
        dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
    }, [dispatch, isDisabled])

    return {
        versions,
        isLoading,
        isViewingHistoricalVersion,
        currentVersionId,
        selectedVersionId,
        onSelectVersion,
        onGoToLatest,
        isDisabled,
        hasNextPage: hasNextPage ?? false,
        isFetchingNextPage,
        onLoadMore,
        shouldLoadMore: (hasNextPage && !isFetchingNextPage) ?? false,
    }
}
