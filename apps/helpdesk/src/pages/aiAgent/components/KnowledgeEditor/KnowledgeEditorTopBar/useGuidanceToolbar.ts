import { useCallback } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import {
    fromArticleTranslationResponse,
    useGuidanceContext,
} from '../KnowledgeEditorGuidance/context'

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
    isVersionHistoryEnabled: boolean
}

export const useGuidanceToolbar = (): GuidanceToolbarData => {
    const isVersionHistoryEnabled = useFlag(
        FeatureFlagKey.AddVersionHistoryForArticlesAndGuidances,
    )
    const { error: notifyError, success: notifySuccess } = useNotify()

    const {
        state,
        dispatch,
        isFormValid,
        canEdit,
        config,
        hasDraft,
        playground,
    } = useGuidanceContext()

    const { guidanceHelpCenter } = config

    const { onUpdateFn } = config

    const { updateGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: guidanceHelpCenter.id ?? 0,
        })

    const onClickEdit = useCallback(() => {
        dispatch({ type: 'SET_MODE', payload: 'edit' })
    }, [dispatch])

    const onOpenPublishModal = useCallback(() => {
        dispatch({ type: 'SET_MODAL', payload: 'publish' })
    }, [dispatch])

    const onClickPublishLegacy = useCallback(async () => {
        if (!state.guidance?.id || !guidanceHelpCenter.default_locale) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            const response = await updateGuidanceArticle(
                {
                    isCurrent: true,
                },
                {
                    articleId: state.guidance.id,
                    locale: guidanceHelpCenter.default_locale,
                },
            )

            if (response) {
                dispatch({
                    type: 'MARK_AS_SAVED',
                    payload: {
                        title: response.title,
                        content: response.content,
                        guidance: fromArticleTranslationResponse(response, {
                            id: state.guidance.id,
                            templateKey: state.guidance?.templateKey ?? null,
                        }),
                    },
                })
                dispatch({ type: 'SET_MODE', payload: 'read' })
                notifySuccess('Guidance published successfully.')
                onUpdateFn?.()
            }
        } catch {
            notifyError('An error occurred while publishing guidance.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
        }
    }, [
        guidanceHelpCenter.default_locale,
        dispatch,
        updateGuidanceArticle,
        notifySuccess,
        notifyError,
        onUpdateFn,
        state.guidance,
    ])

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
        state.historicalVersion !== null,
    )

    const isDisabled =
        state.isUpdating || state.isAutoSaving || isGuidanceArticleUpdating

    const editDisabledReason = !canEdit
        ? 'You already have a draft version. Only one draft is allowed at a time, so the published version is read-only.'
        : undefined

    return {
        state: toolbarState,
        actions: {
            onClickEdit,
            onClickPublish: isVersionHistoryEnabled
                ? onOpenPublishModal
                : onClickPublishLegacy,
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
        isVersionHistoryEnabled,
    }
}

const getToolbarState = (
    guidanceMode: 'create' | 'edit' | 'read',
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
