import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { hasDraft, useGuidanceStore } from '../context'
import { useSwitchVersion } from './useSwitchVersion'

export type VersionBannerState = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: () => Promise<void>
}

export function useVersionBanner(): VersionBannerState {
    const {
        historicalPublishedDatetime,
        isGuidanceCurrent,
        hasPublishedVersion,
        isUpdating,
        isAutoSaving,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            isGuidanceCurrent: storeState.state.guidance?.isCurrent,
            hasPublishedVersion:
                !!storeState.state.guidance?.publishedVersionId,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
        })),
    )
    const guidanceHasDraft = useGuidanceStore((storeState) =>
        hasDraft(storeState.state),
    )

    const isViewingHistoricalVersion =
        historicalPublishedDatetime !== null &&
        historicalPublishedDatetime !== undefined

    const isViewingDraft = isViewingHistoricalVersion
        ? false
        : isGuidanceCurrent === undefined
          ? false
          : !isGuidanceCurrent

    const isDisabled = isUpdating || isAutoSaving

    const { switchToVersion } = useSwitchVersion()

    const switchVersion = useCallback(async () => {
        await switchToVersion(isGuidanceCurrent ? 'latest_draft' : 'current')
    }, [switchToVersion, isGuidanceCurrent])

    return {
        isViewingDraft,
        hasDraftVersion: guidanceHasDraft,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    }
}
