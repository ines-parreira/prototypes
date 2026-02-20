import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { appQueryClient } from 'api/queryClient'
import { getHelpCenterArticleQuery } from 'models/helpCenter/queries'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { VersionBanner } from '../shared/VersionBanner'
import { fromArticleTranslation, useGuidanceStore } from './context'
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
    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const {
        guidanceMode,
        guidanceId,
        historicalVersion,
        guidanceHelpCenterId,
        guidanceHelpCenterLocale,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceMode: storeState.state.guidanceMode,
            guidanceId: storeState.state.guidance?.id ?? 0,
            historicalVersion: storeState.state.historicalVersion,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id ?? 0,
            guidanceHelpCenterLocale:
                storeState.config.guidanceHelpCenter?.default_locale ?? 'en-US',
        })),
    )
    const { client } = useHelpCenterApi()

    const isDiffMode = guidanceMode === 'diff'

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
                    const publishedVersion = await appQueryClient.fetchQuery(
                        getHelpCenterArticleQuery({
                            client,
                            helpCenterId: guidanceHelpCenterId,
                            articleId: guidanceId,
                            locale: guidanceHelpCenterLocale,
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
        guidanceHelpCenterId,
        guidanceHelpCenterLocale,
        guidanceId,
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
            historicalVersion={historicalVersion}
            isDiffMode={isDiffMode}
            onToggleDiff={shouldShowDiffToggle ? onToggleDiff : undefined}
            className={css.guidanceBanner}
        />
    )
}
