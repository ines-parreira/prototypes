import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
} from 'models/helpCenter/types'
import type { GuidanceVariableGroup } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type { GuidanceFormFields } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { KnowledgeEditorSidePanelGuidance } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import type { GuidanceMode } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { KnowledgeEditorTopBarGuidanceControls } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { KnowledgeEditorGuidanceCreateView } from './create/KnowledgeEditorGuidanceCreateView'
import { KnowledgeEditorGuidanceEditView } from './edit/KnowledgeEditorGuidanceEditView'
import { useKnowledgeEditorGuidanceModal } from './hooks/useKnowledgeEditorGuidanceModal'
import { ModalState } from './modals/KnowledgeEditorGuidanceModal.types'
import { KnowledgeEditorGuidanceUnsavedChangesModal } from './modals/KnowledgeEditorGuidanceUnsavedChangesModal'
import { KnowledgeEditorGuidanceReadView } from './read'

import css from './KnowledgeEditorGuidanceView.less'

export type BaseProps = {
    shopName: string
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    guidanceMode: GuidanceMode['mode']
    isFullscreen: boolean
    onToggleFullscreen: () => void
    onTest: () => void
}

type Props = BaseProps & {
    availableActions: GuidanceAction[]
    availableVariables: GuidanceVariableGroup[]
    onSave: (
        fields: GuidanceFormFields,
    ) => Promise<ArticleTranslationResponseDto | undefined> | void
    onCreate: (
        fields: GuidanceFormFields,
    ) => Promise<ArticleWithLocalTranslation | undefined> | void
    onDelete: () => Promise<void> | void
    onDuplicate: () => Promise<void> | void
    title: string
    content: string
    aiAgentEnabled: boolean
    onToggleAIAgentEnabled: () => void
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    onChangeTitle: (title: string) => void
    onChangeContent: (content: string) => void
    isGuidanceArticleUpdating: boolean
    isFullscreen: boolean
    onToggleFullscreen: () => void
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
}

export const KnowledgeEditorGuidanceView = ({
    onClose,
    onClickPrevious,
    onClickNext,
    onSave,
    onCreate,
    onDelete,
    onDuplicate,
    title: titleProp,
    content: contentProp,
    aiAgentEnabled,
    onToggleAIAgentEnabled,
    shopName,
    createdDatetime,
    lastUpdatedDatetime,
    isGuidanceArticleUpdating,
    guidanceMode: initialGuidanceMode,
    availableActions,
    availableVariables,
    isFullscreen,
    onToggleFullscreen,
    onTest,
    closeHandlerRef,
}: Props) => {
    // Local state ONLY for editing
    const [editTitle, setEditTitle] = useState(titleProp)
    const [editContent, setEditContent] = useState(contentProp)
    const [isDetailsView, setIsDetailsView] = useState(false)
    const [guidanceMode, setGuidanceMode] =
        useState<GuidanceMode['mode']>(initialGuidanceMode)
    const { modal, openUnsavedChangesModal } = useKnowledgeEditorGuidanceModal()

    // Baseline: always the prop values (server truth)
    const initialValuesRef = useRef({ title: titleProp, content: contentProp })

    // Track previous props to detect navigation
    const prevPropsRef = useRef({ title: titleProp, content: contentProp })

    // Update baseline during render in read mode (no timing gap)
    if (guidanceMode === 'read') {
        // If props changed (navigation occurred), update baseline immediately
        if (
            prevPropsRef.current.title !== titleProp ||
            prevPropsRef.current.content !== contentProp
        ) {
            initialValuesRef.current = {
                title: titleProp,
                content: contentProp,
            }
        }
    }

    // Always track previous props
    prevPropsRef.current = { title: titleProp, content: contentProp }

    // Reset edit state when props change (via useEffect to avoid render phase setState)
    useEffect(() => {
        if (guidanceMode === 'read') {
            setEditTitle(titleProp)
            setEditContent(contentProp)
        }
    }, [titleProp, contentProp, guidanceMode])

    // Use edit state in edit and create modes, props in read mode
    const currentTitle = guidanceMode === 'read' ? titleProp : editTitle
    const currentContent = guidanceMode === 'read' ? contentProp : editContent

    // Compare current editing state against baseline
    // Only check for changes when actively editing to avoid false positives during navigation
    const hasContentChanged = useMemo(() => {
        // Only check for changes in edit and create modes
        if (guidanceMode === 'read') {
            return false
        }
        return (
            currentTitle !== initialValuesRef.current.title ||
            currentContent !== initialValuesRef.current.content
        )
    }, [currentTitle, currentContent, guidanceMode])

    const isFormValid = useMemo(
        () => currentTitle.trim() !== '' && currentContent.trim() !== '',
        [currentTitle, currentContent],
    )

    const onClickEdit = useCallback(() => {
        setEditTitle(titleProp)
        setEditContent(contentProp)
        setGuidanceMode('edit')
    }, [titleProp, contentProp])

    const onClickSave = useCallback(async () => {
        await onSave({
            name: currentTitle,
            content: currentContent,
            isVisible: aiAgentEnabled,
        })
        setGuidanceMode('read')
    }, [onSave, currentTitle, currentContent, aiAgentEnabled])

    const onClickCancel = useCallback(() => {
        if (hasContentChanged) {
            openUnsavedChangesModal({
                onDiscardChanges: () => {
                    onClose()
                },
                onSaveChanges: async () => {
                    await onClickSave()
                },
            })
        } else {
            onClose()
        }
    }, [hasContentChanged, onClose, openUnsavedChangesModal, onClickSave])

    // Set the close handler ref so parent can use it for SidePanel dismissal
    useEffect(() => {
        closeHandlerRef.current = onClickCancel
    }, [closeHandlerRef, onClickCancel])

    const onClickCreate = useCallback(async () => {
        const response = await onCreate({
            name: currentTitle,
            content: currentContent,
            isVisible: aiAgentEnabled,
        })
        if (response) {
            setGuidanceMode('read')
        }
    }, [onCreate, currentTitle, currentContent, aiAgentEnabled])

    const onClickCopy = useCallback(async () => {
        await onDuplicate()
    }, [onDuplicate])

    const mode = useMemo<GuidanceMode>(
        () =>
            guidanceMode === 'read'
                ? {
                      mode: 'read',
                      onCopy: onClickCopy,
                      onEdit: onClickEdit,
                      onDelete: onDelete,
                      onTest: onTest,
                  }
                : guidanceMode === 'edit'
                  ? {
                        mode: 'edit',
                        onSave:
                            hasContentChanged && isFormValid
                                ? onClickSave
                                : undefined,
                        onCancel: onClickCancel,
                    }
                  : {
                        mode: 'create',
                        onCreate: isFormValid ? onClickCreate : undefined,
                        onCancel: onClickCancel,
                    },
        [
            guidanceMode,
            onClickEdit,
            onDelete,
            onClickCopy,
            onTest,
            onClickSave,
            onClickCancel,
            onClickCreate,
            hasContentChanged,
            isFormValid,
        ],
    )

    const onToggleDetailsView = () => {
        setIsDetailsView(!isDetailsView)
    }

    return (
        <div className={css.knowledgeEditorContainer}>
            <KnowledgeEditorTopBar
                onClickPrevious={
                    guidanceMode !== 'edit' ? onClickPrevious : undefined
                }
                onClickNext={guidanceMode !== 'edit' ? onClickNext : undefined}
                title="Guidance"
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onClose={onClickCancel}
                isDetailsView={isDetailsView}
                onToggleDetailsView={onToggleDetailsView}
                disabled={isGuidanceArticleUpdating}
            >
                <KnowledgeEditorTopBarGuidanceControls
                    {...mode}
                    disabled={isGuidanceArticleUpdating}
                />
            </KnowledgeEditorTopBar>
            <div className={css.editorSection}>
                <div className={css.knowledgeEditor}>
                    {guidanceMode === 'read' && (
                        <KnowledgeEditorGuidanceReadView
                            content={contentProp}
                            title={titleProp}
                            availableActions={availableActions}
                            availableVariables={availableVariables}
                        />
                    )}

                    {guidanceMode === 'edit' && (
                        <KnowledgeEditorGuidanceEditView
                            content={editContent}
                            title={editTitle}
                            onChangeContent={setEditContent}
                            onChangeTitle={setEditTitle}
                            shopName={shopName}
                            availableActions={availableActions}
                            availableVariables={availableVariables}
                        />
                    )}

                    {guidanceMode === 'create' && (
                        <KnowledgeEditorGuidanceCreateView
                            content={editContent}
                            title={editTitle}
                            onChangeContent={setEditContent}
                            onChangeTitle={setEditTitle}
                            shopName={shopName}
                            availableActions={availableActions}
                            availableVariables={availableVariables}
                        />
                    )}

                    {isDetailsView && (
                        <KnowledgeEditorSidePanelGuidance
                            details={{
                                aiAgentStatus: {
                                    value: aiAgentEnabled,
                                    onChange: onToggleAIAgentEnabled,
                                },
                                createdDatetime,
                                lastUpdatedDatetime,
                                isUpdating: isGuidanceArticleUpdating,
                            }}
                        />
                    )}
                </div>
            </div>
            {modal.type === ModalState.UnsavedChanges && hasContentChanged && (
                <KnowledgeEditorGuidanceUnsavedChangesModal
                    isOpen={true}
                    onBackToEditing={modal.onBackToEditing}
                    onDiscard={modal.onDiscard}
                    onSave={modal.onSave}
                />
            )}
        </div>
    )
}
