import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'

import { useArticleContext } from '../context'
import type { ArticleModeType } from '../context/types'

export type ArticleToolbarState =
    | { type: 'create' }
    | { type: 'draft-edit' }
    | { type: 'draft-view' }
    | { type: 'published-with-draft' }
    | { type: 'published-without-draft' }
    | { type: 'published-without-draft-edit' }
    | { type: 'viewing-historical-version' }

export type ArticleToolbarActions = {
    onClickEdit: () => void
    onClickPublish: () => void | Promise<void>
    onOpenDeleteModal: () => void
    onDiscard: () => void
}

export type ArticleToolbarData = {
    state: ArticleToolbarState
    actions: ArticleToolbarActions
    isDisabled: boolean
    isFormValid: boolean
    canEdit: boolean
    editDisabledReason: string | undefined
    onTest: () => void
    isPlaygroundOpen: boolean
    isVersionHistoryEnabled: boolean
}

export const useArticleToolbar = (): ArticleToolbarData => {
    const isPublishModalEnabled = useFlag(
        FeatureFlagKey.AddVersionHistoryForArticlesAndGuidances,
    )
    const { error: notifyError, success: notifySuccess } = useNotify()

    const {
        state,
        dispatch,
        config,
        isFormValid,
        canEdit,
        hasDraft,
        playground,
    } = useArticleContext()

    const { helpCenter, onUpdatedFn } = config

    const updateTranslationMutation = useUpdateArticleTranslation(helpCenter.id)

    const onClickEdit = useCallback(() => {
        dispatch({ type: 'SET_MODE', payload: 'edit' })
    }, [dispatch])

    const onOpenPublishModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'publish' })
    }, [dispatch])

    const onClickPublishLegacy = useCallback(async () => {
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
                notifySuccess('Article published successfully.')
                onUpdatedFn?.()
            }
        } catch {
            notifyError('An error occurred while publishing the article.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        helpCenter.id,
        state.article,
        state.currentLocale,
        updateTranslationMutation,
        dispatch,
        notifySuccess,
        notifyError,
        onUpdatedFn,
    ])

    const onOpenDeleteModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'delete-article' })
    }, [dispatch])

    const onDiscard = useCallback(() => {
        if (state.articleMode === 'create') {
            const hasNoContent = !state.title && !state.content
            if (hasNoContent) {
                config.onClose()
            } else {
                dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
            }
        } else {
            dispatch({ type: 'SET_MODAL', payload: 'discard-draft' })
        }
    }, [state.articleMode, state.title, state.content, config, dispatch])

    const toolbarState = getToolbarState(
        state.articleMode,
        state.article?.translation.is_current,
        hasDraft,
        state.historicalVersion !== null,
    )

    const isDisabled = state.isUpdating || state.isAutoSaving

    const editDisabledReason = !canEdit
        ? 'This version is read-only. View the version with draft edits to make changes.'
        : undefined

    return {
        state: toolbarState,
        actions: {
            onClickEdit,
            onClickPublish: isPublishModalEnabled
                ? onOpenPublishModal
                : onClickPublishLegacy,
            onOpenDeleteModal,
            onDiscard,
        },
        isDisabled,
        isFormValid,
        canEdit,
        editDisabledReason,
        onTest: playground.onTest,
        isPlaygroundOpen: playground.isOpen,
        isVersionHistoryEnabled: isPublishModalEnabled,
    }
}

const getToolbarState = (
    articleMode: ArticleModeType,
    isCurrent: boolean | undefined,
    hasDraft: boolean,
    isViewingHistoricalVersion: boolean,
): ArticleToolbarState => {
    if (isViewingHistoricalVersion) {
        return { type: 'viewing-historical-version' }
    }

    if (articleMode === 'create') {
        return { type: 'create' }
    }

    const isViewingDraft = isCurrent === false
    const isEditMode = articleMode === 'edit'

    if (isViewingDraft) {
        return isEditMode ? { type: 'draft-edit' } : { type: 'draft-view' }
    }

    if (hasDraft) {
        return { type: 'published-with-draft' }
    }

    return isEditMode
        ? { type: 'published-without-draft-edit' }
        : { type: 'published-without-draft' }
}
