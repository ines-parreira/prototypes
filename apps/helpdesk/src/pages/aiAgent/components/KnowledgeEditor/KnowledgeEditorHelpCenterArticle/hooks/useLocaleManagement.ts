import { useCallback, useRef } from 'react'

import { useNotify } from 'hooks/useNotify'
import {
    useDeleteArticleTranslation,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'
import type { LocaleCode } from 'models/helpCenter/types'
import type {
    ActionType as LocaleActionType,
    OptionItem as LocaleOption,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'

import { useArticleContext } from '../context/ArticleContext'
import { createEmptyTranslation } from '../context/utils'

export const useLocaleManagement = () => {
    const { state, dispatch, config, hasPendingContentChanges } =
        useArticleContext()

    const { helpCenter, onDeletedFn } = config
    const { error: notifyError } = useNotify()

    const deleteTranslationMutation = useDeleteArticleTranslation()

    const pendingLocaleActionRef = useRef<{
        action: LocaleActionType
        locale: LocaleOption
    } | null>(null)

    const getArticleQuery = useGetHelpCenterArticle(
        state.article?.id ?? 0,
        helpCenter.id,
        state.currentLocale,
        state.versionStatus,
    )

    const performLocaleSwitch = useCallback(
        async (newLocale: LocaleCode, isCreate: boolean) => {
            if (!state.article?.id) return

            dispatch({ type: 'SET_UPDATING', payload: true })

            try {
                const articleData = await getArticleQuery.refetch()
                const fetchedArticle = articleData.data

                if (fetchedArticle?.translation) {
                    dispatch({
                        type: 'SWITCH_ARTICLE',
                        payload: {
                            article: fetchedArticle,
                            locale: newLocale,
                            translationMode: 'existing',
                        },
                    })
                } else if (isCreate && state.article) {
                    const emptyTranslation = createEmptyTranslation(
                        state.article,
                        newLocale,
                    )
                    dispatch({
                        type: 'SWITCH_ARTICLE',
                        payload: {
                            article: {
                                ...state.article,
                                translation: emptyTranslation,
                            },
                            locale: newLocale,
                            translationMode: 'new',
                        },
                    })
                }
            } catch {
                notifyError('An error occurred while switching locale.')
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
            }
        },
        [state.article, getArticleQuery, dispatch, notifyError],
    )

    const performDeleteTranslation = useCallback(
        async (locale: LocaleOption) => {
            if (!state.article?.id) return

            dispatch({ type: 'SET_UPDATING', payload: true })

            try {
                await deleteTranslationMutation.mutateAsync([
                    undefined,
                    {
                        help_center_id: helpCenter.id,
                        article_id: state.article.id,
                        locale: locale.value,
                    },
                ])
                onDeletedFn?.()
                config.onClose()
            } catch {
                notifyError(
                    'An error occurred while deleting the article translation.',
                )
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
                dispatch({ type: 'CLOSE_MODAL' })
            }
        },
        [
            state.article?.id,
            helpCenter.id,
            deleteTranslationMutation,
            dispatch,
            onDeletedFn,
            config,
            notifyError,
        ],
    )

    const onLocaleAction = useCallback(
        (action: LocaleActionType, locale: LocaleOption) => {
            if (action === 'delete') {
                dispatch({
                    type: 'SET_MODAL',
                    payload: { type: 'delete-translation', locale },
                })
                return
            }

            if (hasPendingContentChanges) {
                pendingLocaleActionRef.current = { action, locale }
                dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
                return
            }

            if (action === 'view') {
                performLocaleSwitch(locale.value, false)
            } else if (action === 'create') {
                performLocaleSwitch(locale.value, true)
            }
        },
        [hasPendingContentChanges, dispatch, performLocaleSwitch],
    )

    const confirmDeleteTranslation = useCallback(() => {
        const modal = state.activeModal
        if (
            modal &&
            typeof modal === 'object' &&
            modal.type === 'delete-translation'
        ) {
            performDeleteTranslation(modal.locale)
        }
    }, [state.activeModal, performDeleteTranslation])

    const handleUnsavedChangesDiscard = useCallback(() => {
        dispatch({ type: 'CLOSE_MODAL' })
        const pending = pendingLocaleActionRef.current
        if (pending) {
            if (pending.action === 'view') {
                performLocaleSwitch(pending.locale.value, false)
            } else if (pending.action === 'create') {
                performLocaleSwitch(pending.locale.value, true)
            }
            pendingLocaleActionRef.current = null
        }
    }, [dispatch, performLocaleSwitch])

    const handleUnsavedChangesSave = useCallback(async () => {
        dispatch({ type: 'CLOSE_MODAL' })
        const pending = pendingLocaleActionRef.current
        if (pending) {
            pendingLocaleActionRef.current = null
        }
    }, [dispatch])

    return {
        currentLocale: state.currentLocale,
        onLocaleAction,
        confirmDeleteTranslation,
        handleUnsavedChangesDiscard,
        handleUnsavedChangesSave,
        isUpdating: state.isUpdating,
    }
}
