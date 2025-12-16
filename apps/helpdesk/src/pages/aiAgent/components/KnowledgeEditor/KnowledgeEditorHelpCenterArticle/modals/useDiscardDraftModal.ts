import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import {
    useDeleteArticleTranslationDraft,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'

import { useArticleContext } from '../context'

export const useDiscardDraftModal = () => {
    const { state, dispatch, config } = useArticleContext()
    const { error: notifyError, success: notifySuccess } = useNotify()

    const deleteTranslationDraftMutation = useDeleteArticleTranslationDraft()

    const getArticleQuery = useGetHelpCenterArticle(
        state.article?.id ?? 0,
        config.helpCenter.id,
        state.currentLocale,
        'current',
    )

    const onDiscard = useCallback(async () => {
        if (!state.article?.id) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            await deleteTranslationDraftMutation.mutateAsync([
                undefined,
                {
                    help_center_id: config.helpCenter.id,
                    article_id: state.article.id,
                    locale: state.currentLocale,
                },
            ])
            notifySuccess('Draft discarded')

            const hasPublishedVersion =
                !!state.article.translation.published_version_id

            if (hasPublishedVersion) {
                const articleData = await getArticleQuery.refetch()
                if (articleData.data) {
                    dispatch({
                        type: 'SWITCH_VERSION',
                        payload: {
                            article: articleData.data,
                            versionStatus: 'current',
                        },
                    })
                }
            } else {
                config.onClose()
            }
            config.onUpdatedFn?.()
        } catch {
            notifyError('An error occurred while discarding draft.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        deleteTranslationDraftMutation,
        getArticleQuery,
        state.article,
        state.currentLocale,
        config,
        dispatch,
        notifySuccess,
        notifyError,
    ])

    return {
        isOpen: state.activeModal === 'discard-draft',
        isDiscarding: state.isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDiscard,
    }
}
