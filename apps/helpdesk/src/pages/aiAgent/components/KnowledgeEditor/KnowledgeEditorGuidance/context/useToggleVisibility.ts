import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useGuidanceContext } from './KnowledgeEditorGuidanceContext'
import { fromArticleTranslationResponse } from './utils'

export const useToggleVisibility = () => {
    const { error: notifyError } = useNotify()

    const { state, dispatch, config } = useGuidanceContext()

    const { onUpdateFn, guidanceHelpCenter } = config

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: guidanceHelpCenter.id ?? 0,
    })

    const toggleVisibility = useCallback(async () => {
        if (!state.guidance?.id || !guidanceHelpCenter.default_locale) return

        const newVisibility = state.visibility ? 'UNLISTED' : 'PUBLIC'

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await updateGuidanceArticle(
                {
                    visibility: newVisibility,
                    isCurrent: false,
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
                        }),
                    },
                })
                dispatch({ type: 'SET_VISIBILITY', payload: !state.visibility })
                onUpdateFn?.()
            }
        } catch {
            notifyError('An error occurred while updating visibility.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        state.guidance?.id,
        state.visibility,
        guidanceHelpCenter.default_locale,
        dispatch,
        updateGuidanceArticle,
        notifyError,
        onUpdateFn,
    ])

    return { toggleVisibility }
}
