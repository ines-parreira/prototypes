import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useInfiniteGetArticleTranslationVersions } from 'models/helpCenter/queries'

import type { ArticleTranslationVersion } from '../context'
import { useGuidanceContext } from '../context'

const VERSIONS_PER_PAGE = 20

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

export function useVersionHistory(): VersionHistoryData {
    const isVersionHistoryEnabled = useFlag(
        FeatureFlagKey.AddVersionHistoryForArticlesAndGuidances,
    )
    const { state, dispatch, config } = useGuidanceContext()

    const { guidanceHelpCenter } = config

    const helpCenterId = guidanceHelpCenter?.id ?? 0
    const articleId = state.guidance?.id ?? 0
    const locale = guidanceHelpCenter?.default_locale ?? 'en-US'

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

    const isViewingHistoricalVersion = state.historicalVersion !== null

    const currentVersionId = state.guidance?.publishedVersionId ?? null

    const selectedVersionId = state.historicalVersion?.versionId ?? null

    const isDisabled = state.isUpdating || state.isAutoSaving

    const onSelectVersion = useCallback(
        (version: ArticleTranslationVersion) => {
            if (isDisabled) return

            const isCurrentVersion =
                currentVersionId !== null && version.id === currentVersionId

            if (isCurrentVersion) {
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
            } else {
                dispatch({ type: 'VIEW_HISTORICAL_VERSION', payload: version })
            }
        },
        [dispatch, currentVersionId, isDisabled],
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
