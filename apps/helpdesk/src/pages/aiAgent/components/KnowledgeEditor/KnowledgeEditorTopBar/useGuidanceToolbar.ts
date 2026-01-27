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

export type GuidanceToolbarActions = {
    duplicateGuidanceToShops: (
        articleIds: number[],
        shopNames: string[],
    ) => Promise<{
        success: boolean
        shopNames?: string[]
    }>
    onClickEdit: () => void
    onClickPublish: () => void | Promise<void>
    onOpenDiscardModal: () => void
    onOpenDeleteModal: () => void
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
    const isPublishModalEnabled = useFlag(
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

    const { onCopyFn, onUpdateFn } = config

    const { duplicate, updateGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: guidanceHelpCenter.id ?? 0,
        })

    /**
     * Duplicates guidance articles to specified shops.
     *
     * This wrapper function adds application-specific behavior around the raw duplicate mutation:
     * - Updates Knowledge Editor context state (SET_UPDATING)
     * - Executes the onCopyFn callback after successful duplication
     * - Returns success/failure status (error notifications handled by DuplicateGuidance component)
     *
     * @param articleIds - Array of article IDs to duplicate
     * @param shopNames - Array of shop names to duplicate articles to
     * @returns Promise resolving to success status and shop names
     */
    const duplicateGuidanceToShops = useCallback(
        async (articleIds: number[], shopNames: string[]) => {
            if (articleIds.length === 0) {
                return { success: false }
            }

            dispatch({ type: 'SET_UPDATING', payload: true })
            try {
                await duplicate(articleIds, shopNames)
                onCopyFn?.()
                return { success: true, shopNames }
            } catch {
                return { success: false }
            } finally {
                dispatch({ type: 'SET_UPDATING', payload: false })
            }
        },
        [duplicate, onCopyFn, dispatch],
    )

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
    )

    const isDisabled =
        state.isUpdating || state.isAutoSaving || isGuidanceArticleUpdating

    const editDisabledReason = !canEdit
        ? 'You already have a draft version. Only one draft is allowed at a time, so the published version is read-only.'
        : undefined

    return {
        state: toolbarState,
        actions: {
            duplicateGuidanceToShops,
            onClickEdit,
            onClickPublish: isPublishModalEnabled
                ? onOpenPublishModal
                : onClickPublishLegacy,
            onOpenDiscardModal,
            onOpenDeleteModal,
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
    guidanceMode: 'create' | 'edit' | 'read',
    isCurrent: boolean | undefined,
    hasDraft: boolean,
): GuidanceToolbarState => {
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
