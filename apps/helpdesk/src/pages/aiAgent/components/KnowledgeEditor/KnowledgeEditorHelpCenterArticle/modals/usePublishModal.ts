import { useCallback, useEffect, useRef } from 'react'

import { toast } from '@gorgias/axiom'

import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'

import { useArticleContext } from '../context'

export const usePublishModal = () => {
    const { state, dispatch, config } = useArticleContext()

    const { helpCenter, onUpdatedFn } = config

    const updateTranslationMutation = useUpdateArticleTranslation(helpCenter.id)

    const onPublish = useCallback(
        async (commitMessage: string) => {
            if (!state.article?.id) return

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
                        is_current: true,
                        commit_message: commitMessage || undefined,
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
                    dispatch({ type: 'SET_MODE', payload: 'read' })
                    toast.success('Article published successfully.')
                    onUpdatedFn?.()
                }
            } catch {
                toast.error('An error occurred while publishing the article.')
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
                dispatch({ type: 'CLOSE_MODAL' })
            }
        },
        [
            helpCenter.id,
            state.article,
            state.currentLocale,
            updateTranslationMutation,
            dispatch,
            onUpdatedFn,
        ],
    )

    const onPublishRef = useRef(onPublish)
    onPublishRef.current = onPublish

    const isFirstPublish =
        state.article?.translation.published_version_id === null

    useEffect(() => {
        if (state.activeModal === 'publish' && isFirstPublish) {
            onPublishRef.current('')
        }
    }, [state.activeModal, isFirstPublish])

    return {
        isOpen: state.activeModal === 'publish' && !isFirstPublish,
        isPublishing: state.isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onPublish,
    }
}
