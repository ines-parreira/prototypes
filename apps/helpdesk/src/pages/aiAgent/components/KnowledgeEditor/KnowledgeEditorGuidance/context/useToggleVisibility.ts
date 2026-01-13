import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useGuidanceContext } from './KnowledgeEditorGuidanceContext'
import { useGuidanceLimit } from './useGuidanceLimit'

export const useToggleVisibility = () => {
    const { error: notifyError } = useNotify()

    const { state, dispatch, config } = useGuidanceContext()

    const {
        onUpdateFn,
        guidanceHelpCenter,
        guidanceArticles,
        handleVisibilityUpdate,
    } = config

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: guidanceHelpCenter.id ?? 0,
    })

    const { isAtLimit, limitMessage } = useGuidanceLimit(guidanceArticles)

    const toggleVisibility = useCallback(async () => {
        if (!state.guidance?.id || !guidanceHelpCenter.default_locale) return

        const newVisibility = state.visibility ? 'UNLISTED' : 'PUBLIC'

        // Prevent enabling if at limit
        if (newVisibility === 'PUBLIC' && isAtLimit) {
            notifyError(limitMessage)
            return
        }

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
                // NOTE: we are not calling MARK_AS_SAVED here because changing visibility
                // doesn't create a new version and modifies the structure in place. Ideally the API should return the current version
                // where it is applied, although it doesn't do that now.
                dispatch({ type: 'SET_VISIBILITY', payload: !state.visibility })
                onUpdateFn?.()
                handleVisibilityUpdate?.(newVisibility)
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
        isAtLimit,
        limitMessage,
        handleVisibilityUpdate,
    ])

    return {
        toggleVisibility,
        isAtLimit,
        limitMessage,
    }
}
