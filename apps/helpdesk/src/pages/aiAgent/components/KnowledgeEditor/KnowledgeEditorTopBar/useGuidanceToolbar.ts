import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import {
    canEdit,
    hasDraft,
    isFormValid,
    useGuidanceStore,
    useGuidanceStoreApi,
} from '../KnowledgeEditorGuidance/context'
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
    const store = useGuidanceStoreApi()
    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const onClose = useGuidanceStore((storeState) => storeState.config.onClose)
    const { onTest, isPlaygroundOpen } = useGuidanceStore(
        useShallow((storeState) => ({
            onTest: storeState.playground.onTest,
            isPlaygroundOpen: storeState.playground.isOpen,
        })),
    )
    const {
        guidanceMode,
        isGuidanceCurrent,
        historicalPublishedDatetime,
        isUpdating,
        isAutoSaving,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceMode: storeState.state.guidanceMode,
            isGuidanceCurrent: storeState.state.guidance?.isCurrent,
            historicalPublishedDatetime:
                storeState.state.historicalVersion?.publishedDatetime,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
        })),
    )
    const guidanceCanEdit = useGuidanceStore((storeState) =>
        canEdit(storeState.state),
    )
    const guidanceHasDraft = useGuidanceStore((storeState) =>
        hasDraft(storeState.state),
    )
    const guidanceIsFormValid = useGuidanceStore((storeState) =>
        isFormValid(storeState.state),
    )

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
        const currentState = store.getState().state
        const hasNoContent = !currentState.title && !currentState.content

        if (hasNoContent) {
            onClose()
        } else {
            dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
        }
    }, [store, onClose, dispatch])

    const toolbarState = getToolbarState(
        guidanceMode,
        isGuidanceCurrent,
        guidanceHasDraft,
        historicalPublishedDatetime !== null &&
            historicalPublishedDatetime !== undefined,
    )

    const isDisabled = isUpdating || isAutoSaving

    const editDisabledReason =
        toolbarState.type === 'published-with-draft' || !guidanceCanEdit
            ? 'This version is read-only. Edit the draft to make changes.'
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
        isFormValid: guidanceIsFormValid,
        canEdit: guidanceCanEdit,
        editDisabledReason,
        onTest,
        isPlaygroundOpen,
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
