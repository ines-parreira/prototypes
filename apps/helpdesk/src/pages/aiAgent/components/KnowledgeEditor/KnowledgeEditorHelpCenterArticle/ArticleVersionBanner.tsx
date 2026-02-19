import { useCallback } from 'react'

import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { VersionBanner } from '../shared/VersionBanner'
import { useArticleContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

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
    const { client } = useHelpCenterApi()

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
                    const publishedVersion = await getHelpCenterArticle(
                        client,
                        {
                            help_center_id: config.helpCenter.id,
                            id: state.article?.id ?? 0,
                        },
                        {
                            locale: state.currentLocale,
                            version_status: 'current',
                        },
                    )
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
        client,
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
