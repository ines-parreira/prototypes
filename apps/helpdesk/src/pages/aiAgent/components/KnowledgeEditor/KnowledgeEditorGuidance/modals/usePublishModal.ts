import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { fromArticleTranslationResponse, useGuidanceContext } from '../context'

export const usePublishModal = () => {
    const { state, dispatch, config } = useGuidanceContext()
    const { error: notifyError, success: notifySuccess } = useNotify()

    const { guidanceHelpCenter, onUpdateFn } = config

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: guidanceHelpCenter?.id ?? 0,
    })

    const onPublish = useCallback(
        async (commitMessage: string) => {
            if (!state.guidance?.id || !guidanceHelpCenter.default_locale)
                return

            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                const response = await updateGuidanceArticle(
                    {
                        isCurrent: true,
                        commitMessage: commitMessage || undefined,
                    },
                    {
                        articleId: state.guidance.id,
                        locale: guidanceHelpCenter.default_locale,
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
                                templateKey:
                                    state.guidance?.templateKey ?? null,
                            }),
                        },
                    })
                    dispatch({ type: 'SET_MODE', payload: 'read' })
                    notifySuccess('Guidance published successfully.')
                    onUpdateFn?.()
                }
            } catch {
                notifyError('An error occurred while publishing guidance.')
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
                dispatch({ type: 'CLOSE_MODAL' })
            }
        },
        [
            guidanceHelpCenter?.default_locale,
            dispatch,
            updateGuidanceArticle,
            notifySuccess,
            notifyError,
            onUpdateFn,
            state.guidance,
        ],
    )

    return {
        isOpen: state.activeModal === 'publish',
        isPublishing: state.isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onPublish,
    }
}
