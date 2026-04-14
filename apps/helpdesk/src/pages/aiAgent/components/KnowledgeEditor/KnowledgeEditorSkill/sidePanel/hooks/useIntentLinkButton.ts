import { useShallow } from 'zustand/react/shallow'

import { useSkillEditorStore } from '../../context/KnowledgeEditorSkillContext'

const LINK_INTENTS_HISTORICAL_TOOLTIP =
    'You are viewing a past version. Switch to the latest version to link intents.'
const LINK_INTENTS_PUBLISHED_WITH_DRAFT_TOOLTIP =
    'A draft of this skill exists. Switch to the draft to link intents.'

export const useIntentLinkButton = () => {
    const {
        skillIsCurrent,
        publishedVersionId,
        draftVersionId,
        historicalPublishedDatetime,
        isUpdating,
        isAutoSaving,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillIsCurrent: storeState.state.skill?.isCurrent,
            publishedVersionId: storeState.state.skill?.publishedVersionId,
            draftVersionId: storeState.state.skill?.draftVersionId,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
        })),
    )

    const isViewingHistoricalVersion = historicalPublishedDatetime != null
    const hasDraft =
        draftVersionId != null &&
        publishedVersionId != null &&
        draftVersionId !== publishedVersionId
    const isViewingPublishedWithDraft = skillIsCurrent === true && hasDraft

    const disabledTooltip = isViewingHistoricalVersion
        ? LINK_INTENTS_HISTORICAL_TOOLTIP
        : isViewingPublishedWithDraft
          ? LINK_INTENTS_PUBLISHED_WITH_DRAFT_TOOLTIP
          : undefined

    const isDisabled =
        disabledTooltip !== undefined || isUpdating || isAutoSaving
    const canUnlink =
        !isViewingHistoricalVersion &&
        !isDisabled &&
        !isUpdating &&
        !isAutoSaving

    return {
        isDisabled,
        disabledTooltip,
        canUnlink,
        isUpdating,
    }
}
