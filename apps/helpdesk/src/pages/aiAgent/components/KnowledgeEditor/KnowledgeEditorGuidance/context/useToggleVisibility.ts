import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useGuidanceStore } from './KnowledgeEditorGuidanceContext'
import { useGuidanceLimit } from './useGuidanceLimit'

export const useToggleVisibility = () => {
    const { error: notifyError } = useNotify()

    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const {
        guidanceId,
        visibility,
        onUpdateFn,
        guidanceHelpCenterId,
        guidanceHelpCenterLocale,
        guidanceArticles,
        handleVisibilityUpdate,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceId: storeState.state.guidance?.id,
            visibility: storeState.state.visibility,
            onUpdateFn: storeState.config.onUpdateFn,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter.id ?? 0,
            guidanceHelpCenterLocale:
                storeState.config.guidanceHelpCenter.default_locale,
            guidanceArticles: storeState.config.guidanceArticles,
            handleVisibilityUpdate: storeState.config.handleVisibilityUpdate,
        })),
    )

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId,
    })

    const { isAtLimit, limitMessage } = useGuidanceLimit(guidanceArticles)

    const toggleVisibility = useCallback(async () => {
        if (!guidanceId || !guidanceHelpCenterLocale) return

        const newVisibility = visibility ? 'UNLISTED' : 'PUBLIC'

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
                    articleId: guidanceId,
                    locale: guidanceHelpCenterLocale,
                },
            )

            if (response) {
                // NOTE: we are not calling MARK_AS_SAVED here because changing visibility
                // doesn't create a new version and modifies the structure in place. Ideally the API should return the current version
                // where it is applied, although it doesn't do that now.
                dispatch({ type: 'SET_VISIBILITY', payload: !visibility })
                onUpdateFn?.()
                handleVisibilityUpdate?.(newVisibility)
            }
        } catch {
            notifyError('An error occurred while updating visibility.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        guidanceId,
        visibility,
        guidanceHelpCenterLocale,
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
