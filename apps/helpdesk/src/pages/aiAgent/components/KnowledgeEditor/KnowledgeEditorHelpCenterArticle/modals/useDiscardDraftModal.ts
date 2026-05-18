import { useCallback } from 'react'

import { toast } from '@gorgias/axiom'

import { useDeleteArticleTranslationDraft } from 'models/helpCenter/mutations'

import { useArticleContext } from '../context'

export const useDiscardDraftModal = () => {
    const { state, dispatch, config } = useArticleContext()

    const { mutateAsync: discardDraftMutation } =
        useDeleteArticleTranslationDraft(config.helpCenter.id)

    const onDiscard = useCallback(async () => {
        if (!state.article?.id) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await discardDraftMutation([
                undefined,
                {
                    help_center_id: config.helpCenter.id,
                    article_id: state.article.id,
                    locale: state.currentLocale,
                },
            ])

            if (response && response.data && 'title' in response.data) {
                toast.success('Draft discarded')
                dispatch({
                    type: 'SWITCH_VERSION',
                    payload: {
                        article: {
                            ...state.article,
                            translation: {
                                ...response.data,
                            },
                        },
                        versionStatus: 'current',
                    },
                })
                config.onUpdatedFn?.()
            } else {
                config.onClose()
                config.onDeletedFn?.()
            }
        } catch (err) {
            console.error(err)
            toast.error('An error occurred while discarding draft.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
        }
    }, [
        discardDraftMutation,
        state.article,
        state.currentLocale,
        config,
        dispatch,
    ])

    return {
        isOpen: state.activeModal === 'discard-draft',
        isDiscarding: state.isUpdating,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDiscard,
    }
}
