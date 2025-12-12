import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { fromArticleTranslation, useGuidanceContext } from '../context'

export type VersionBannerState = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: () => Promise<void>
}

export function useVersionBanner(): VersionBannerState {
    const { state, dispatch, config, hasDraft } = useGuidanceContext()
    const { error: notifyError } = useNotify()
    const { client } = useHelpCenterApi()

    const { guidanceHelpCenter } = config

    const isViewingDraft =
        state.guidance?.isCurrent === undefined
            ? false
            : !state.guidance?.isCurrent

    const hasPublishedVersion = !!state.guidance?.publishedVersionId

    const isDisabled = state.isUpdating || state.isAutoSaving

    const switchVersion = useCallback(async () => {
        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await getHelpCenterArticle(
                client,
                {
                    help_center_id: guidanceHelpCenter?.id ?? 0,
                    id: state.guidance?.id ?? 0,
                },
                {
                    locale: guidanceHelpCenter?.default_locale ?? 'en-US',
                    version_status: state.guidance?.isCurrent
                        ? 'latest_draft'
                        : 'current',
                },
            )
            if (response) {
                dispatch({
                    type: 'SWITCH_VERSION',
                    payload: fromArticleTranslation(response),
                })
            }
        } catch {
            notifyError('An error occurred while switching version.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        dispatch,
        client,
        guidanceHelpCenter?.id,
        guidanceHelpCenter?.default_locale,
        state.guidance?.id,
        state.guidance?.isCurrent,
        notifyError,
    ])

    return {
        isViewingDraft,
        hasDraftVersion: hasDraft,
        hasPublishedVersion,
        isDisabled,
        switchVersion,
    }
}
