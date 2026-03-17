import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'

import { formatIntentLabel } from '../utils/formatIntentLabel'

const EMPTY_INTENT_IDS: string[] = []

const LINK_INTENTS_HISTORICAL_TOOLTIP =
    'You are viewing a past version. Switch to the latest version to link intents.'
const LINK_INTENTS_PUBLISHED_WITH_DRAFT_TOOLTIP =
    'A draft of this guidance exists. Switch to the draft to link intents.'

type IntentDiffStatus = 'added' | 'removed' | null

type IntentDiffPart = {
    intentId: string
    diffStatus: IntentDiffStatus
}

function buildIntentDiffParts(
    oldIntents?: string[] | null,
    newIntents?: string[] | null,
): IntentDiffPart[] {
    const previousIntentIds = oldIntents ?? EMPTY_INTENT_IDS
    const nextIntentIds = newIntents ?? EMPTY_INTENT_IDS
    const nextIntentSet = new Set(nextIntentIds)
    const previousIntentSet = new Set(previousIntentIds)

    const unchangedAndRemoved = previousIntentIds.map((intentId) => ({
        intentId,
        diffStatus: nextIntentSet.has(intentId) ? null : ('removed' as const),
    }))

    const added = nextIntentIds
        .filter((intentId) => !previousIntentSet.has(intentId))
        .map((intentId) => ({
            intentId,
            diffStatus: 'added' as const,
        }))

    return [...unchangedAndRemoved, ...added]
}

export const useLinkedIntentsSidebar = () => {
    const {
        guidanceMode,
        guidanceIntentIds,
        historicalVersionIntentIds,
        comparisonVersionIntentIds,
        guidanceIsCurrent,
        publishedVersionId,
        draftVersionId,
        historicalPublishedDatetime,
        isUpdating,
        isAutoSaving,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceMode: storeState.state.guidanceMode,
            guidanceIntentIds:
                storeState.state.guidance?.intents ?? EMPTY_INTENT_IDS,
            historicalVersionIntentIds:
                storeState.state.historicalVersion?.intents ?? EMPTY_INTENT_IDS,
            comparisonVersionIntentIds:
                storeState.state.comparisonVersion?.intents ?? EMPTY_INTENT_IDS,
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

    const isDiffMode = guidanceMode === 'diff'
    const displayedIntentIds = isViewingHistoricalVersion
        ? historicalVersionIntentIds
        : guidanceIntentIds
    const intentDiffParts = isDiffMode
        ? buildIntentDiffParts(
              isViewingHistoricalVersion
                  ? historicalVersionIntentIds
                  : comparisonVersionIntentIds,
              isViewingHistoricalVersion
                  ? comparisonVersionIntentIds
                  : guidanceIntentIds,
          )
        : []

    const getLinkedIntentLabelById = useCallback(
        (intentId: string) => formatIntentLabel(intentId),
        [],
    )

    return {
        guidanceIntentIds: displayedIntentIds,
        intentDiffParts,
        isDiffMode,
        isViewingHistoricalVersion,
        linkIntentsDisabledTooltip,
        isLinkIntentsButtonDisabled,
        canUnlinkIntentsFromSidebar,
        isUpdating,
        getLinkedIntentLabelById,
    }
}
