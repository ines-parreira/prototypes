import { useCallback, useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGetArticleTranslationIntents } from 'models/helpCenter/queries'
import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'

import type { LinkedIntent } from '../modals/KnowledgeEditorSidePanelSectionLinkedIntentsModal'

const EMPTY_INTENT_IDS: string[] = []

const LINK_INTENTS_HISTORICAL_TOOLTIP =
    'You are viewing a past version. Switch to the latest version to link intents.'
const LINK_INTENTS_PUBLISHED_WITH_DRAFT_TOOLTIP =
    'A draft of this guidance exists. Switch to the draft to link intents.'

const getLinkedIntentLabel = (linkedIntent: LinkedIntent) => {
    if (linkedIntent.name.includes('/')) {
        return linkedIntent.name
    }
    return `${linkedIntent.groupName}/${linkedIntent.name.toLowerCase()}`
}

export const useLinkedIntentsSidebar = () => {
    const {
        guidanceIntentIds,
        guidanceIsCurrent,
        publishedVersionId,
        draftVersionId,
        historicalPublishedDatetime,
        guidanceHelpCenterId,
        guidanceId,
        guidanceLocale,
        isUpdating,
        isAutoSaving,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceIntentIds:
                storeState.state.guidance?.intents ?? EMPTY_INTENT_IDS,
            guidanceIsCurrent: storeState.state.guidance?.isCurrent,
            publishedVersionId: storeState.state.guidance?.publishedVersionId,
            draftVersionId: storeState.state.guidance?.draftVersionId,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id ?? 0,
            guidanceId: storeState.state.guidance?.id,
            guidanceLocale: storeState.state.guidance?.locale,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
        })),
    )

    const areIntentPathParamsReady =
        guidanceHelpCenterId !== 0 &&
        guidanceId !== undefined &&
        guidanceLocale !== undefined

    const { data: articleTranslationIntents } = useGetArticleTranslationIntents(
        {
            help_center_id: guidanceHelpCenterId,
            article_id: guidanceId ?? 0,
            locale: guidanceLocale ?? '',
        },
        {
            enabled: areIntentPathParamsReady,
        },
    )

    const availableLinkedIntentsById = useMemo(
        () =>
            (articleTranslationIntents?.intents ?? []).reduce<
                Record<string, LinkedIntent>
            >((acc, group) => {
                group.children.forEach((intent) => {
                    acc[intent.intent] = {
                        ...intent,
                        groupName: group.name,
                    }
                })

                return acc
            }, {}),
        [articleTranslationIntents?.intents],
    )

    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined
    const hasDraft =
        draftVersionId != null &&
        publishedVersionId != null &&
        draftVersionId !== publishedVersionId
    const isViewingPublishedWithDraft = guidanceIsCurrent === true && hasDraft

    const linkIntentsDisabledTooltip = isViewingHistoricalVersion
        ? LINK_INTENTS_HISTORICAL_TOOLTIP
        : isViewingPublishedWithDraft
          ? LINK_INTENTS_PUBLISHED_WITH_DRAFT_TOOLTIP
          : undefined

    const isLinkIntentsButtonDisabled =
        linkIntentsDisabledTooltip !== undefined || isUpdating || isAutoSaving
    const canUnlinkIntentsFromSidebar =
        !isViewingHistoricalVersion &&
        !isLinkIntentsButtonDisabled &&
        !isUpdating &&
        !isAutoSaving

    const getLinkedIntentLabelById = useCallback(
        (intentId: string) => {
            const linkedIntent = availableLinkedIntentsById[intentId]

            if (!linkedIntent) {
                return ''
            }

            return getLinkedIntentLabel(linkedIntent)
        },
        [availableLinkedIntentsById],
    )

    return {
        guidanceIntentIds,
        isViewingHistoricalVersion,
        linkIntentsDisabledTooltip,
        isLinkIntentsButtonDisabled,
        canUnlinkIntentsFromSidebar,
        isUpdating,
        getLinkedIntentLabelById,
    }
}
