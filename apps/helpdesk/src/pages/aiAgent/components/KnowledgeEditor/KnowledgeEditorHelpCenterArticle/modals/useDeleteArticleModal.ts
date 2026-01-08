import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useDeleteArticle } from 'models/helpCenter/mutations'

import { useArticleContext } from '../context'

export const useDeleteArticleModal = () => {
    const { state, dispatch, config } = useArticleContext()
    const { error: notifyError } = useNotify()

    const { mutateAsync: deleteArticleMutation } = useDeleteArticle(
        config.helpCenter.id,
    )

    const onDelete = useCallback(async () => {
        if (!state.article?.id) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            await deleteArticleMutation([
                undefined,
                {
                    help_center_id: config.helpCenter.id,
                    id: state.article.id,
                },
            ])
            config.onDeletedFn?.()
        } catch {
            notifyError('An error occurred while deleting the article.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
            config.onClose()
        }
    }, [
        deleteArticleMutation,
        state.article?.id,
        config,
        dispatch,
        notifyError,
    ])

    const { published_version_id, draft_version_id } =
        state.article?.translation ?? {}
    const hasBothVersions =
        !!published_version_id && draft_version_id !== published_version_id

    return {
        isOpen: state.activeModal === 'delete-article',
        isDeleting: state.isUpdating,
        hasBothVersions,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDelete,
    }
}
