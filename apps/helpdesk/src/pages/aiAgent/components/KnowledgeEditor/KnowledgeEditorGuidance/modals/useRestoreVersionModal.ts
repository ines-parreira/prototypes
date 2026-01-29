import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { fromArticleTranslationResponse, useGuidanceContext } from '../context'

export const useRestoreVersionModal = () => {
    const { state, dispatch, config } = useGuidanceContext()
    const { error: notifyError, success: notifySuccess } = useNotify()

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: config.guidanceHelpCenter?.id ?? 0,
    })

    const onRestore = useCallback(async () => {
        if (
            !state.guidance?.id ||
            !config.guidanceHelpCenter?.default_locale ||
            !state.historicalVersion
        ) {
            return
        }

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await updateGuidanceArticle(
                {
                    isCurrent: false,
                    title: state.historicalVersion.title,
                    content: state.historicalVersion.content,
                },
                {
                    articleId: state.guidance.id,
                    locale: config.guidanceHelpCenter.default_locale,
                },
            )

            if (response) {
                dispatch({
                    type: 'MARK_AS_SAVED',
                    payload: {
                        title: response.title,
                        content: response.content,
                        guidance: fromArticleTranslationResponse(response, {
                            id: state.guidance.id,
                            templateKey: state.guidance?.templateKey ?? null,
                        }),
                    },
                })
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
                dispatch({ type: 'SET_MODE', payload: 'read' })
                notifySuccess('Version restored as draft.')
                config.onUpdateFn?.()
            }
        } catch {
            notifyError('An error occurred while restoring version.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        updateGuidanceArticle,
        state.guidance?.id,
        state.guidance?.templateKey,
        state.historicalVersion,
        config,
        dispatch,
        notifySuccess,
        notifyError,
    ])

    return {
        isOpen: state.activeModal === 'restore',
        isRestoring: state.isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onRestore,
    }
}
