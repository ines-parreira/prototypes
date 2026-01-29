import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'

import { useArticleContext } from '../context'

export const useRestoreVersionModal = () => {
    const { state, dispatch, config } = useArticleContext()
    const { error: notifyError, success: notifySuccess } = useNotify()

    const { helpCenter, onUpdatedFn } = config

    const updateTranslationMutation = useUpdateArticleTranslation(helpCenter.id)

    const onRestore = useCallback(async () => {
        if (!state.article?.id || !state.historicalVersion) {
            return
        }

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await updateTranslationMutation.mutateAsync([
                undefined,
                {
                    help_center_id: helpCenter.id,
                    article_id: state.article.id,
                    locale: state.currentLocale,
                },
                {
                    title: state.historicalVersion.title,
                    content: state.historicalVersion.content,
                    is_current: false,
                },
            ])

            if (response?.data) {
                dispatch({
                    type: 'MARK_CONTENT_AS_SAVED',
                    payload: {
                        title: response.data.title,
                        content: response.data.content,
                        article: {
                            ...state.article,
                            translation: {
                                ...state.article.translation,
                                ...response.data,
                            },
                        },
                    },
                })
                dispatch({ type: 'CLEAR_HISTORICAL_VERSION' })
                dispatch({ type: 'SET_MODE', payload: 'read' })
                notifySuccess('Version restored as draft.')
                onUpdatedFn?.()
            }
        } catch {
            notifyError('An error occurred while restoring version.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        updateTranslationMutation,
        state.article,
        state.historicalVersion,
        state.currentLocale,
        helpCenter.id,
        dispatch,
        notifySuccess,
        notifyError,
        onUpdatedFn,
    ])

    return {
        isOpen: state.activeModal === 'restore',
        isRestoring: state.isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onRestore,
    }
}
