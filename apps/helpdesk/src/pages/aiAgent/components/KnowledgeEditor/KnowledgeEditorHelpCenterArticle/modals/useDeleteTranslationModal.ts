import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useDeleteArticleTranslation } from 'models/helpCenter/queries'
import type { OptionItem as LocaleOption } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect'

import { useArticleContext } from '../context'

export const useDeleteTranslationModal = () => {
    const { state, dispatch, config } = useArticleContext()
    const { error: notifyError } = useNotify()

    const deleteTranslationMutation = useDeleteArticleTranslation()

    const activeModal = state.activeModal
    const isOpen =
        activeModal !== null &&
        typeof activeModal === 'object' &&
        activeModal.type === 'delete-translation'

    const locale: LocaleOption | undefined = isOpen
        ? activeModal.locale
        : undefined

    const onDelete = useCallback(async () => {
        if (!state.article?.id || !locale) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            await deleteTranslationMutation.mutateAsync([
                undefined,
                {
                    help_center_id: config.helpCenter.id,
                    article_id: state.article.id,
                    locale: locale.value,
                },
            ])
            config.onDeletedFn?.()
            config.onClose()
        } catch {
            notifyError('An error occurred while deleting the translation.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        deleteTranslationMutation,
        state.article?.id,
        locale,
        config,
        dispatch,
        notifyError,
    ])

    return {
        isOpen,
        isDeleting: state.isUpdating,
        locale,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDelete,
    }
}
