import { useCallback } from 'react'

import { useGuidanceContext } from '../context'
import { useSwitchVersion } from './useSwitchVersion'

export type VersionBannerState = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: () => Promise<void>
}

export function useVersionBanner(): VersionBannerState {
    const { state, hasDraft } = useGuidanceContext()

    const isViewingHistoricalVersion =
        state.historicalVersion !== null &&
        state.historicalVersion.publishedDatetime !== null

    const isViewingDraft = isViewingHistoricalVersion
        ? false
        : state.guidance?.isCurrent === undefined
          ? false
          : !state.guidance?.isCurrent

    const hasPublishedVersion = !!state.guidance?.publishedVersionId

    const isDisabled = state.isUpdating || state.isAutoSaving

    const { switchToVersion } = useSwitchVersion()

    const switchVersion = useCallback(async () => {
        const isCurrent = state.guidance?.isCurrent
        await switchToVersion(isCurrent ? 'latest_draft' : 'current')
    }, [switchToVersion, state.guidance?.isCurrent])

    return {
        isViewingDraft,
        hasDraftVersion: hasDraft,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    }
}
