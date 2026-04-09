import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { formatIntentName } from 'pages/aiAgent/skills/utils'

import { useSkillEditorStore } from '../../context/KnowledgeEditorSkillContext'

const EMPTY_INTENT_IDS: string[] = []

const LINK_INTENTS_HISTORICAL_TOOLTIP =
    'You are viewing a past version. Switch to the latest version to link intents.'
const LINK_INTENTS_PUBLISHED_WITH_DRAFT_TOOLTIP =
    'A draft of this skill exists. Switch to the draft to link intents.'

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

export const useLinkedIntentsSidebarSkill = () => {
    const {
        mode,
        intentIds,
        historicalVersionIntentIds,
        comparisonVersionIntentIds,
        skillIsCurrent,
        publishedVersionId,
        draftVersionId,
        historicalPublishedDatetime,
        isUpdating,
        isAutoSaving,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            mode: storeState.state.mode,
            intentIds: storeState.state.intents,
            historicalVersionIntentIds:
                storeState.state.historicalVersion?.intents ?? EMPTY_INTENT_IDS,
            comparisonVersionIntentIds:
                storeState.state.comparisonVersion?.intents ?? EMPTY_INTENT_IDS,
            skillIsCurrent: storeState.state.skill?.isCurrent,
            publishedVersionId: storeState.state.skill?.publishedVersionId,
            draftVersionId: storeState.state.skill?.draftVersionId,
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
    const isViewingPublishedWithDraft = skillIsCurrent === true && hasDraft

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

    const isDiffMode = mode === 'diff'
    const displayedIntentIds = isViewingHistoricalVersion
        ? historicalVersionIntentIds
        : intentIds
    const intentDiffParts = isDiffMode
        ? buildIntentDiffParts(
              isViewingHistoricalVersion
                  ? historicalVersionIntentIds
                  : comparisonVersionIntentIds,
              isViewingHistoricalVersion
                  ? comparisonVersionIntentIds
                  : intentIds,
          )
        : []

    const getLinkedIntentLabelById = useCallback(
        (intentId: string) => formatIntentName(intentId),
        [],
    )

    return {
        displayedIntentIds,
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
