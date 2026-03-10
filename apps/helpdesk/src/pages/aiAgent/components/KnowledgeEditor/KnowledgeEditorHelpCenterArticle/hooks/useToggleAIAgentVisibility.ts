import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import { VisibilityStatusEnum } from 'models/helpCenter/types'

import { useArticleContext } from '../context/ArticleContext'

export const useToggleAIAgentVisibility = () => {
    const { state, dispatch, config } = useArticleContext()
    const { helpCenter, onUpdatedFn } = config
    const { error: notifyError, success: notifySuccess } = useNotify()

    const { mutateAsync: updateTranslationMutation } =
        useUpdateArticleTranslation(helpCenter.id)

    const currentVisibilityStatus = state.article?.translation.visibility_status

    const toggleAIAgentVisibility = useCallback(async () => {
        if (!state.article?.id) return

        const newStatus =
            currentVisibilityStatus === VisibilityStatusEnum.UNLISTED
                ? VisibilityStatusEnum.PUBLIC
                : VisibilityStatusEnum.UNLISTED

        dispatch({ type: 'SET_UPDATING', payload: true })

        try {
            const response = await updateTranslationMutation([
                undefined,
                {
                    help_center_id: helpCenter.id,
                    article_id: state.article.id,
                    locale: state.currentLocale,
                },
                {
                    visibility_status: newStatus,
                    customer_visibility:
                        state.article.translation.customer_visibility,
                    is_current: false,
                },
            ])

            if (response?.data) {
                dispatch({
                    type: 'UPDATE_TRANSLATION',
                    payload: {
                        ...response.data,
                        is_current: state.article.translation.is_current,
                    },
                })
                onUpdatedFn?.()
                notifySuccess(
                    newStatus === VisibilityStatusEnum.PUBLIC
                        ? 'Content enabled for AI Agent.'
                        : 'Content disabled for AI Agent.',
                )
            }
        } catch {
            notifyError('An error occurred while updating AI Agent visibility.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        state.article?.id,
        state.article?.translation.customer_visibility,
        state.article?.translation.is_current,
        state.currentLocale,
        currentVisibilityStatus,
        helpCenter.id,
        updateTranslationMutation,
        dispatch,
        onUpdatedFn,
        notifyError,
        notifySuccess,
    ])

    return { toggleAIAgentVisibility }
}
