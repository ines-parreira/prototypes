import { useCallback } from 'react'

import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { VersionBanner } from '../shared/VersionBanner'
import { fromArticleTranslation, useGuidanceContext } from './context'
import { useVersionBanner } from './hooks/useVersionBanner'
import { useVersionHistory } from './hooks/useVersionHistory'

import css from './KnowledgeEditorGuidanceVersionBanner.less'

export function KnowledgeEditorGuidanceVersionBanner() {
    const {
        isViewingDraft,
        hasDraftVersion,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    } = useVersionBanner()

    const { isViewingHistoricalVersion, onGoToLatest } = useVersionHistory()
    const { state, dispatch, config } = useGuidanceContext()
    const { client } = useHelpCenterApi()

    const isDiffMode = state.guidanceMode === 'diff'

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
                            help_center_id: config.guidanceHelpCenter?.id ?? 0,
                            id: state.guidance?.id ?? 0,
                        },
                        {
                            locale:
                                config.guidanceHelpCenter?.default_locale ??
                                'en-US',
                            version_status: 'current',
                        },
                    )
                    if (publishedVersion) {
                        const article = fromArticleTranslation(publishedVersion)
                        dispatch({
                            type: 'SET_COMPARISON_VERSION',
                            payload: {
                                title: article.title,
                                content: article.content,
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
        config.guidanceHelpCenter,
        state.guidance?.id,
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
            className={css.guidanceBanner}
        />
    )
}
