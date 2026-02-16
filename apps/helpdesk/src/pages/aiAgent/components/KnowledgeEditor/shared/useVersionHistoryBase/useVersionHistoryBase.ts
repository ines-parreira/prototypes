import { useCallback, useMemo } from 'react'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import {
    useGetArticleTranslationVersion,
    useInfiniteGetArticleTranslationVersions,
} from 'models/helpCenter/queries'
import type { Components } from 'rest_api/help_center_api/client.generated'

import { useVersionHistoryTracking } from '../useVersionHistoryTracking/useVersionHistoryTracking'

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
    version: number
    publishedDatetime: string | null
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
    shopName: string
    resourceType: 'guidance' | 'article'
    helpCenterId: number
    articleId: number
    locale: string
    currentVersionId: number | null
    draftVersionId: number | null
    isViewingDraft?: boolean
    historicalVersion: HistoricalVersion
    isUpdating: boolean
    isAutoSaving: boolean
    dispatch: VersionHistoryDispatch
    switchToVersion?: (
        targetStatus: 'latest_draft' | 'current',
    ) => Promise<void>
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
    shopName,
    resourceType,
    helpCenterId,
    articleId,
    locale,
    currentVersionId,
    draftVersionId,
    isViewingDraft,
    historicalVersion,
    isUpdating,
    isAutoSaving,
    dispatch,
    switchToVersion,
}: VersionHistoryBaseParams): VersionHistoryData {
    const { onVersionViewed, onBackToCurrent } = useVersionHistoryTracking({
        shopName,
        resourceType,
        resourceId: articleId,
        helpCenterId,
        locale,
    })
    const isEnabled = !!helpCenterId && !!articleId && !!locale

    const hasDraft =
        draftVersionId != null &&
        currentVersionId != null &&
        draftVersionId !== currentVersionId

    const { data: draftVersion, isLoading: isDraftLoading } =
        useGetArticleTranslationVersion(
            {
                help_center_id: helpCenterId,
                article_id: articleId,
                locale,
                version_id: draftVersionId ?? 0,
            },
            {
                enabled: isEnabled && hasDraft,
            },
        )

    const {
        data,
        isLoading: isPublishedLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteGetArticleTranslationVersions(
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

    const isLoading = isPublishedLoading || (hasDraft && isDraftLoading)

    const versions = useMemo(() => {
        const publishedVersions =
            data?.pages.flatMap((page) => page?.data ?? []) ?? []

        if (hasDraft && draftVersion) {
            return [draftVersion, ...publishedVersions]
        }

        return publishedVersions
    }, [data, hasDraft, draftVersion])

    const onLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const isViewingHistoricalVersion = historicalVersion !== null

    const selectedVersionId =
        historicalVersion?.versionId ??
        (hasDraft && isViewingDraft && draftVersionId ? draftVersionId : null)

    const isDisabled = isUpdating || isAutoSaving

    const onSelectVersion = useCallback(
        (version: ArticleTranslationVersion) => {
            if (isDisabled) return

            onVersionViewed({
                versionId: version.id,
                versionNumber: version.version,
                publishedDatetime: version.published_datetime,
            })

            const isDraftVersion = version.published_datetime === null
            const isCurrentPublished =
                currentVersionId !== null && version.id === currentVersionId

            if (isDraftVersion) {
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
                if (!isViewingDraft && switchToVersion) {
                    switchToVersion('latest_draft')
                }
            } else if (isCurrentPublished) {
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
                if (isViewingDraft && switchToVersion) {
                    switchToVersion('current')
                }
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
        [
            dispatch,
            currentVersionId,
            isDisabled,
            isViewingDraft,
            switchToVersion,
            versions,
            onVersionViewed,
        ],
    )

    const onGoToLatest = useCallback(() => {
        if (isDisabled) return
        if (historicalVersion) {
            onBackToCurrent({
                versionId: historicalVersion.versionId,
                versionNumber: historicalVersion.version,
                publishedDatetime: historicalVersion.publishedDatetime,
            })
        }
        if (switchToVersion) {
            switchToVersion('latest_draft').then(() =>
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' }),
            )
        }
    }, [
        dispatch,
        isDisabled,
        historicalVersion,
        onBackToCurrent,
        switchToVersion,
    ])

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
