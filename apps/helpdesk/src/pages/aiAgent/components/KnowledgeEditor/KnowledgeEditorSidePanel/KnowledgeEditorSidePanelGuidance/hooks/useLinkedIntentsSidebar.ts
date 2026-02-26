import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'

import { formatIntentLabel } from '../utils/formatIntentLabel'

const EMPTY_INTENT_IDS: string[] = []

const LINK_INTENTS_HISTORICAL_TOOLTIP =
    'You are viewing a past version. Switch to the latest version to link intents.'
const LINK_INTENTS_PUBLISHED_WITH_DRAFT_TOOLTIP =
    'A draft of this guidance exists. Switch to the draft to link intents.'

export const useLinkedIntentsSidebar = () => {
    const {
        guidanceIntentIds,
        guidanceIsCurrent,
        publishedVersionId,
        draftVersionId,
        historicalPublishedDatetime,
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
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
        })),
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
        (intentId: string) => formatIntentLabel(intentId),
        [],
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
