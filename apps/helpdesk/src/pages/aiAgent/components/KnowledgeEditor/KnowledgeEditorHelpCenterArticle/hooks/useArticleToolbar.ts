import { useCallback } from 'react'

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
}

export const useArticleToolbar = (): ArticleToolbarData => {
    const {
        state,
        dispatch,
        config,
        isFormValid,
        canEdit,
        hasDraft,
        playground,
    } = useArticleContext()

    const { onEditFn } = config
    const onClickEdit = useCallback(() => {
        onEditFn?.()
        dispatch({ type: 'SET_MODE', payload: 'edit' })
    }, [dispatch, onEditFn])

    const onOpenPublishModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'publish' })
    }, [dispatch])

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

    const editDisabledReason =
        toolbarState.type === 'published-with-draft' || !canEdit
            ? 'This version is read-only. Edit the draft to make changes.'
            : undefined

    return {
        state: toolbarState,
        actions: {
            onClickEdit,
            onClickPublish: onOpenPublishModal,
            onOpenDeleteModal,
            onDiscard,
        },
        isDisabled,
        isFormValid,
        canEdit,
        editDisabledReason,
        onTest: playground.onTest,
        isPlaygroundOpen: playground.isOpen,
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
