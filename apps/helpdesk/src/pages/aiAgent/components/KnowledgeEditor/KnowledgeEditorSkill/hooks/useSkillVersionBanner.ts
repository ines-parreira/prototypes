import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import {
    hasDraft,
    useSkillEditorStore,
} from '../context/KnowledgeEditorSkillContext'
import { useSkillSwitchVersion } from './useSkillSwitchVersion'

export type SkillVersionBannerState = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: () => Promise<void>
    isPreview?: boolean
}

export function useSkillVersionBanner(): SkillVersionBannerState {
    const {
        historicalPublishedDatetime,
        isSkillCurrent,
        hasPublishedVersion,
        isUpdating,
        isAutoSaving,
        isPreview,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            isSkillCurrent: storeState.state.skill?.isCurrent,
            hasPublishedVersion: !!storeState.state.skill?.publishedVersionId,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            isPreview: storeState.config.isPreviewMode,
        })),
    )
    const skillHasDraft = useSkillEditorStore((storeState) =>
        hasDraft(storeState.state),
    )

    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined

    const isViewingDraft = isViewingHistoricalVersion
        ? false
        : isSkillCurrent === undefined
          ? false
          : !isSkillCurrent

    const isDisabled = isUpdating || isAutoSaving

    const { switchToVersion } = useSkillSwitchVersion()

    const switchVersion = useCallback(async () => {
        await switchToVersion(isSkillCurrent ? 'latest_draft' : 'current')
    }, [switchToVersion, isSkillCurrent])

    return {
        isViewingDraft,
        hasDraftVersion: skillHasDraft,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
        isPreview,
    }
}
