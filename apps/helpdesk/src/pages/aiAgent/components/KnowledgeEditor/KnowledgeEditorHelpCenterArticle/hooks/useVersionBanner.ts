import { useCallback } from 'react'

import { useArticleContext } from '../context'
import { useSwitchVersion } from './useSwitchVersion'

export type VersionBannerState = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: () => Promise<void>
}

export function useVersionBanner(): VersionBannerState {
    const { state, hasDraft } = useArticleContext()

    const isViewingHistoricalVersion =
        state.historicalVersion != null &&
        state.historicalVersion.publishedDatetime != null

    const isViewingDraft = isViewingHistoricalVersion
        ? false
        : state.article?.translation.is_current === false

    const hasPublishedVersion =
        !!state.article?.translation.published_version_id

    const isDisabled = state.isUpdating || state.isAutoSaving

    const { switchToVersion } = useSwitchVersion()

    const switchVersion = useCallback(async () => {
        const isCurrent = state.article?.translation.is_current
        await switchToVersion(isCurrent ? 'latest_draft' : 'current')
    }, [switchToVersion, state.article?.translation.is_current])

    return {
        isViewingDraft,
        hasDraftVersion: hasDraft,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    }
}
