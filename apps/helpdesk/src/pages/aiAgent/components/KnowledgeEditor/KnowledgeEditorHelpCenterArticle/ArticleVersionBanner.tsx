import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    getHelpCenterArticleQuery,
    type GetHelpCenterArticleQueryOptions,
} from 'models/helpCenter/queries'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { VersionBanner } from '../shared/VersionBanner'
import { useArticleContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

const useFetchHelpCenterArticle = () => {
    const queryClient = useQueryClient()
    const { client } = useHelpCenterApi()

    return useCallback(
        (params: Omit<GetHelpCenterArticleQueryOptions, 'client'>) =>
            queryClient.fetchQuery(
                getHelpCenterArticleQuery({
                    ...params,
                    client,
                }),
            ),
        [queryClient, client],
    )
}

export function ArticleVersionBanner() {
    const {
        isViewingDraft,
        hasDraftVersion,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    } = useVersionBanner()

    const { isViewingHistoricalVersion, onGoToLatest } = useVersionHistory()
    const { state, dispatch, config } = useArticleContext()
    const fetchHelpCenterArticle = useFetchHelpCenterArticle()

    const isDiffMode = state.articleMode === 'diff'

    const onToggleDiff = useCallback(async () => {
        if (isDiffMode) {
            dispatch({ type: 'SET_MODE', payload: 'read' })
            if (isViewingDraft) {
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
            }
        } else {
            if (
                (isViewingDraft || isViewingHistoricalVersion) &&
                hasPublishedVersion
            ) {
                try {
                    const publishedVersion = await fetchHelpCenterArticle({
                        helpCenterId: config.helpCenter.id,
                        articleId: state.article?.id ?? 0,
                        locale: state.currentLocale,
                        versionStatus: 'current',
                    })
                    if (publishedVersion) {
                        dispatch({
                            type: 'SET_COMPARISON_VERSION',
                            payload: {
                                title: publishedVersion.translation.title,
                                content: publishedVersion.translation.content,
                            },
                        })
                    }
                } catch (error) {
                    console.error('Failed to fetch published version:', error)
                }
            }
            dispatch({ type: 'SET_MODE', payload: 'diff' })
        }
    }, [
        isDiffMode,
        isViewingDraft,
        isViewingHistoricalVersion,
        hasPublishedVersion,
        dispatch,
        fetchHelpCenterArticle,
        config.helpCenter.id,
        state.article?.id,
        state.currentLocale,
    ])

    const shouldShowDiffToggle =
        isViewingHistoricalVersion || (isViewingDraft && hasPublishedVersion)

    return (
        <VersionBanner
            isViewingDraft={isViewingDraft}
            hasDraftVersion={hasDraftVersion}
            hasPublishedVersion={hasPublishedVersion}
            isDisabled={isDisabled}
            switchVersion={switchVersion}
            isViewingHistoricalVersion={isViewingHistoricalVersion}
            onGoToLatest={onGoToLatest}
            historicalVersion={state.historicalVersion}
            isDiffMode={isDiffMode}
            onToggleDiff={shouldShowDiffToggle ? onToggleDiff : undefined}
        />
    )
}
