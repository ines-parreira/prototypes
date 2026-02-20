import { useCallback } from 'react'

import { appQueryClient } from 'api/queryClient'
import { getHelpCenterArticleQuery } from 'models/helpCenter/queries'
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
                    const helpCenterId = config.guidanceHelpCenter?.id ?? 0
                    const articleId = state.guidance?.id ?? 0
                    const locale =
                        config.guidanceHelpCenter?.default_locale ?? 'en-US'
                    const publishedVersion = await appQueryClient.fetchQuery(
                        getHelpCenterArticleQuery({
                            client,
                            helpCenterId,
                            articleId,
                            locale,
                            versionStatus: 'current',
                        }),
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
