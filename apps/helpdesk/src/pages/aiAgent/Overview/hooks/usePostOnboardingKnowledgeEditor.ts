import { useCallback, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { logEvent, SegmentEvent } from '@repo/logging'

import { toast } from '@gorgias/axiom'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import type { GuidanceMode } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { GuidanceTemplate } from 'pages/aiAgent/types'

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
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

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

        toast.success(
            'Guidance saved! You can update or edit it anytime in Knowledge.',
            { duration: Duration.seconds(3) },
        )
    }, [shopName, shopType])

    /**
     * Called after a guidance article is successfully updated.
     * Shows success notification.
     */
    const handleUpdate = useCallback(() => {
        toast.success(
            'Guidance saved! You can update or edit it anytime in Knowledge.',
            { duration: Duration.seconds(3) },
        )
    }, [])

    /**
     * Called after a guidance article is successfully deleted.
     * Shows success notification and closes the editor.
     */
    const handleDelete = useCallback(() => {
        closeEditor()
        toast.success('Guidance successfully deleted.', {
            duration: Duration.seconds(3),
        })
    }, [closeEditor])

    /**
     * Called after a guidance article is successfully duplicated.
     * Shows success notification.
     */
    const handleCopy = useCallback(() => {
        toast.success('Guidance successfully duplicated.', {
            duration: Duration.seconds(3),
        })
    }, [])

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
        guidanceHelpCenterId: storeConfiguration?.guidanceHelpCenterId || 0,
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
