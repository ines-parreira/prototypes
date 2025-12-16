import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { getHelpCenterArticle } from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import { useArticleContext } from '../context'

export type VersionBannerState = {
    isViewingDraft: boolean
    hasDraftVersion: boolean
    hasPublishedVersion: boolean
    isDisabled: boolean
    switchVersion: () => Promise<void>
}

export function useVersionBanner(): VersionBannerState {
    const { state, dispatch, config, hasDraft } = useArticleContext()
    const { error: notifyError } = useNotify()
    const { client } = useHelpCenterApi()

    const { helpCenter } = config

    const isViewingDraft = state.article?.translation.is_current === false

    const hasPublishedVersion =
        !!state.article?.translation.published_version_id

    const isDisabled = state.isUpdating || state.isAutoSaving

    const switchVersion = useCallback(async () => {
        if (!state.article?.id) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const isCurrent = state.article.translation.is_current
            const response = await getHelpCenterArticle(
                client,
                {
                    help_center_id: helpCenter.id,
                    id: state.article.id,
                },
                {
                    locale: state.currentLocale,
                    version_status: isCurrent ? 'latest_draft' : 'current',
                },
            )
            if (response) {
                dispatch({
                    type: 'SWITCH_VERSION',
                    payload: {
                        article: response,
                        versionStatus: isCurrent ? 'latest_draft' : 'current',
                    },
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
        helpCenter.id,
        state.article?.id,
        state.article?.translation.is_current,
        state.currentLocale,
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
