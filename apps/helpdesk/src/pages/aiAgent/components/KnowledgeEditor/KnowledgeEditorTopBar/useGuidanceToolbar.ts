import { useCallback } from 'react'

import { useGuidanceContext } from '../KnowledgeEditorGuidance/context'
import type { GuidanceModeType } from '../KnowledgeEditorGuidance/context/types'

export type GuidanceToolbarState =
    | { type: 'published-with-draft' }
    | { type: 'published-without-draft' }
    | { type: 'published-without-draft-edit' }
    | { type: 'draft-view' }
    | { type: 'draft-edit' }
    | { type: 'create' }
    | { type: 'viewing-historical-version' }

export type GuidanceToolbarActions = {
    onClickEdit: () => void
    onClickPublish: () => void | Promise<void>
    onOpenDiscardModal: () => void
    onOpenDeleteModal: () => void
    onOpenDuplicateModal: () => void
    onDiscardCreate: () => void
}

export type GuidanceToolbarData = {
    state: GuidanceToolbarState
    actions: GuidanceToolbarActions
    isDisabled: boolean
    isFormValid: boolean
    canEdit: boolean
    editDisabledReason: string | undefined
    onTest: () => void
    isPlaygroundOpen: boolean
}

export const useGuidanceToolbar = (): GuidanceToolbarData => {
    const {
        state,
        dispatch,
        isFormValid,
        canEdit,
        config,
        hasDraft,
        playground,
    } = useGuidanceContext()

    const onClickEdit = useCallback(() => {
        dispatch({ type: 'SET_MODE', payload: 'edit' })
    }, [dispatch])

    const onOpenPublishModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'publish' })
    }, [dispatch])

    const onOpenDiscardModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'discard' })
    }, [dispatch])

    const onOpenDeleteModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'delete' })
    }, [dispatch])

    const onOpenDuplicateModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'duplicate' })
    }, [dispatch])

    const onDiscardCreate = useCallback(() => {
        const hasNoContent = !state.title && !state.content
        if (hasNoContent) {
            config.onClose()
        } else {
            dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
        }
    }, [state.title, state.content, config, dispatch])

    const toolbarState = getToolbarState(
        state.guidanceMode,
        state.guidance?.isCurrent,
        hasDraft,
        state.historicalVersion !== null &&
            state.historicalVersion.publishedDatetime !== null,
    )

    const isDisabled = state.isUpdating || state.isAutoSaving

    const editDisabledReason = !canEdit
        ? 'This version is read-only. View the version with draft edits to make changes.'
        : undefined

    return {
        state: toolbarState,
        actions: {
            onClickEdit,
            onClickPublish: onOpenPublishModal,
            onOpenDiscardModal,
            onOpenDeleteModal,
            onOpenDuplicateModal,
            onDiscardCreate,
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
    guidanceMode: GuidanceModeType,
    isCurrent: boolean | undefined,
    hasDraft: boolean,
    isViewingHistoricalVersion: boolean,
): GuidanceToolbarState => {
    if (isViewingHistoricalVersion) {
        return { type: 'viewing-historical-version' }
    }

    if (guidanceMode === 'create') {
        return { type: 'create' }
    }

    const isViewingDraft = isCurrent === false
    const isEditMode = guidanceMode === 'edit'

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
