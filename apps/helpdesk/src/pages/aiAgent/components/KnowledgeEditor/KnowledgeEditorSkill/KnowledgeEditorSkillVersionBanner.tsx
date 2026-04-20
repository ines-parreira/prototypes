import { useCallback, useEffect } from 'react'

import { appQueryClient } from '@repo/api-resources'
import { useShallow } from 'zustand/react/shallow'

import { getHelpCenterArticleQuery } from 'models/helpCenter/queries'
import { fromArticleTranslation } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context/utils'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { VersionBanner } from '../shared/VersionBanner'
import { useSkillEditorStore } from './context'
import { useSkillVersionBanner } from './hooks/useSkillVersionBanner'
import { useSkillVersionHistory } from './hooks/useSkillVersionHistory'

export function KnowledgeEditorSkillVersionBanner() {
    const {
        isViewingDraft,
        hasDraftVersion,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    } = useSkillVersionBanner()

    const { isViewingHistoricalVersion, onGoToLatest } =
        useSkillVersionHistory()

    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const {
        mode,
        skillId,
        helpCenterId,
        helpCenterLocale,
        historicalVersion,
        comparisonVersion,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            skillId: storeState.state.skill?.id ?? 0,
            helpCenterId: storeState.config.helpCenter.id,
            helpCenterLocale:
                storeState.config.helpCenter.default_locale ?? 'en-US',
            historicalVersion: storeState.state.historicalVersion,
            comparisonVersion: storeState.state.comparisonVersion,
        })),
    )
    const { client } = useHelpCenterApi()

    const isDiffMode = mode === 'diff'

    const fetchAndSetComparisonVersion = useCallback(async () => {
        try {
            const publishedVersion = await appQueryClient.fetchQuery(
                getHelpCenterArticleQuery({
                    client,
                    helpCenterId,
                    articleId: skillId,
                    locale: helpCenterLocale,
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
                        intents: article.intents,
                        useSupportingContent: article.useSupportingContent,
                    },
                })
            }
        } catch (error) {
            console.error('Failed to fetch published version:', error)
        }
    }, [client, helpCenterId, helpCenterLocale, skillId, dispatch])

    // Eagerly load comparison version when viewing a draft
    useEffect(() => {
        if (
            isViewingDraft &&
            hasPublishedVersion &&
            !comparisonVersion &&
            skillId > 0
        ) {
            void fetchAndSetComparisonVersion()
        }
    }, [
        isViewingDraft,
        hasPublishedVersion,
        comparisonVersion,
        skillId,
        fetchAndSetComparisonVersion,
    ])

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
                if (!comparisonVersion) {
                    await fetchAndSetComparisonVersion()
                }
            }
            dispatch({ type: 'SET_MODE', payload: 'diff' })
        }
    }, [
        isDiffMode,
        isViewingDraft,
        isViewingHistoricalVersion,
        hasPublishedVersion,
        comparisonVersion,
        dispatch,
        fetchAndSetComparisonVersion,
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
        />
    )
}
