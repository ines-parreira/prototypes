import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { fromArticleTranslationResponse, useGuidanceContext } from '../context'

export const useDiscardDraftModal = () => {
    const { state, dispatch, config } = useGuidanceContext()
    const { error: notifyError, success: notifySuccess } = useNotify()

    const { discardGuidanceDraft } = useGuidanceArticleMutation({
        guidanceHelpCenterId: config.guidanceHelpCenter?.id ?? 0,
    })

    const onDiscard = useCallback(async () => {
        if (!state.guidance?.id || !config.guidanceHelpCenter?.default_locale)
            return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await discardGuidanceDraft(
                state.guidance.id,
                config.guidanceHelpCenter.default_locale,
            )
            config.onUpdateFn?.()
            notifySuccess('Draft discarded')

            // The API returns the current version if one exists, otherwise the article is deleted entirely.
            if (response && 'title' in response) {
                dispatch({
                    type: 'SWITCH_VERSION',
                    payload: fromArticleTranslationResponse(response, {
                        id: state.guidance.id,
                    }),
                })
            } else {
                config.onClose()
            }
        } catch {
            notifyError('An error occurred while discarding draft.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        discardGuidanceDraft,
        state.guidance?.id,
        config,
        dispatch,
        notifySuccess,
        notifyError,
    ])

    return {
        isOpen: state.activeModal === 'discard',
        isDiscarding: state.isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDiscard,
    }
}
