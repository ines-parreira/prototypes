import { useCallback, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import type { GuidanceMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import type { GuidanceTemplate } from 'pages/aiAgent/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type UsePostOnboardingKnowledgeEditorProps = {
    shopName: string
    shopType: string
}

/**
 * Custom hook to manage KnowledgeEditor state and interactions within Post Onboarding Tasks.
 * Handles opening/closing the editor and managing guidance lifecycle events.
 */
export const usePostOnboardingKnowledgeEditor = ({
    shopName,
    shopType,
}: UsePostOnboardingKnowledgeEditorProps) => {
    const dispatch = useAppDispatch()
    const { routes } = useAiAgentNavigation({ shopName })

    // -------------------------
    // State
    // -------------------------
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [currentGuidanceArticleId, setCurrentGuidanceArticleId] = useState<
        number | undefined
    >(undefined)
    const [guidanceMode, setGuidanceMode] =
        useState<GuidanceMode['mode']>('create')
    const [guidanceTemplate, setGuidanceTemplate] = useState<
        GuidanceTemplate | undefined
    >(undefined)

    // -------------------------
    // Handlers - Open/Close Editor
    // -------------------------

    /**
     * Opens the editor in create mode.
     * Optionally accepts a template to pre-fill content.
     */
    const openEditorForCreate = useCallback((template?: GuidanceTemplate) => {
        setCurrentGuidanceArticleId(undefined)
        setGuidanceTemplate(template)
        setGuidanceMode('create')
        setIsEditorOpen(true)
    }, [])

    /**
     * Opens the editor in edit mode for a given article.
     */
    const openEditorForEdit = useCallback((articleId: number) => {
        setCurrentGuidanceArticleId(articleId)
        setGuidanceTemplate(undefined)
        setGuidanceMode('edit')
        setIsEditorOpen(true)
    }, [])

    /**
     * Closes the editor and resets state.
     */
    const closeEditor = useCallback(() => {
        setIsEditorOpen(false)
        setCurrentGuidanceArticleId(undefined)
        setGuidanceTemplate(undefined)
    }, [])

    // -------------------------
    // Handlers - Lifecycle Callbacks
    // -------------------------

    /**
     * Called after a guidance article is successfully created.
     * Logs segment event and shows success notification.
     */
    const handleCreate = useCallback(() => {
        logEvent(SegmentEvent.PostOnboardingTaskActionDone, {
            step: StepName.TRAIN,
            action: 'created_guidance',
            shop_name: shopName,
            shop_type: shopType,
        })

        dispatch(
            notify({
                message: `Guidance saved! You can update or edit it anytime in <a href=${routes.knowledge}  style="color: var(--content-neutral-default, #1e242e);"> Knowledge</a>.`,
                allowHTML: true,
                dismissAfter: 3000,
                status: NotificationStatus.Success,
            }),
        )
    }, [shopName, shopType, dispatch, routes])

    /**
     * Called after a guidance article is successfully updated.
     * Shows success notification.
     */
    const handleUpdate = useCallback(() => {
        dispatch(
            notify({
                message: `Guidance saved! You can update or edit it anytime in <a href=${routes.knowledge}  style="color: var(--content-neutral-default, #1e242e);"> Knowledge</a>.`,
                allowHTML: true,
                dismissAfter: 3000,
                status: NotificationStatus.Success,
            }),
        )
    }, [dispatch, routes])

    /**
     * Called after a guidance article is successfully deleted.
     * Shows success notification and closes the editor.
     */
    const handleDelete = useCallback(() => {
        closeEditor()
        void dispatch(
            notify({
                message: 'Guidance successfully deleted.',
                dismissAfter: 3000,
                status: NotificationStatus.Success,
            }),
        )
    }, [dispatch, closeEditor])

    /**
     * Called after a guidance article is successfully duplicated.
     * Shows success notification.
     */
    const handleCopy = useCallback(() => {
        dispatch(
            notify({
                message: 'Guidance successfully duplicated.',
                dismissAfter: 3000,
                status: NotificationStatus.Success,
            }),
        )
    }, [dispatch])

    // -------------------------
    // Derived props for KnowledgeEditor component
    // -------------------------
    const knowledgeEditorProps = {
        variant: 'guidance' as const,
        shopName,
        shopType,
        guidanceArticleId: currentGuidanceArticleId,
        guidanceTemplate,
        guidanceMode,
        isOpen: isEditorOpen,
        onClose: closeEditor,
        onCreate: handleCreate,
        onUpdate: handleUpdate,
        onDelete: handleDelete,
        onCopy: handleCopy,
    }

    return {
        // State
        isEditorOpen,
        currentGuidanceArticleId,
        guidanceMode,

        // Handlers
        openEditorForCreate,
        openEditorForEdit,
        closeEditor,

        // Props object for easy spreading
        knowledgeEditorProps,
    }
}
