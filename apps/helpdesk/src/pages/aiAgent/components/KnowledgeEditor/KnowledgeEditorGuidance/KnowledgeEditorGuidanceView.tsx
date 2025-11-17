import { useCallback, useMemo, useState } from 'react'

import type {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
} from 'models/helpCenter/types'
import type { GuidanceVariableGroup } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import { KnowledgeEditorGuidanceCreateView } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/KnowledgeEditorGuidanceCreateView'
import { KnowledgeEditorGuidanceEditView } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/KnowledgeEditorGuidanceEditView'
import { KnowledgeEditorGuidanceReadView } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/KnowledgeEditorGuidanceReadView'
import type { GuidanceFormFields } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { KnowledgeEditorSidePanelGuidance } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import type { GuidanceMode } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'
import { KnowledgeEditorTopBarGuidanceControls } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'

import css from './KnowledgeEditorGuidanceView.less'

export type BaseProps = {
    shopName: string
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    guidanceMode: GuidanceMode['mode']
    isFullscreen: boolean
    onToggleFullscreen: () => void
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
}

export const KnowledgeEditorGuidanceView = ({
    onClose,
    onClickPrevious,
    onClickNext,
    onSave,
    onCreate,
    onDelete,
    onDuplicate,
    title,
    content,
    aiAgentEnabled,
    onToggleAIAgentEnabled,
    shopName,
    createdDatetime,
    lastUpdatedDatetime,
    onChangeTitle,
    onChangeContent,
    isGuidanceArticleUpdating,
    guidanceMode: initialGuidanceMode,
    availableActions,
    availableVariables,
    isFullscreen,
    onToggleFullscreen,
}: Props) => {
    const [initialTitle] = useState(title)
    const [initialContent] = useState(content)
    const [isDetailsView, setIsDetailsView] = useState(false)
    const [guidanceMode, setGuidanceMode] =
        useState<GuidanceMode['mode']>(initialGuidanceMode)

    const hasContentChanged = useMemo(
        () => title !== initialTitle || content !== initialContent,
        [title, initialTitle, content, initialContent],
    )

    const isFormValid = useMemo(
        () => title.trim() !== '' && content.trim() !== '',
        [title, content],
    )

    const onClickEdit = useCallback(() => {
        setGuidanceMode('edit')
    }, [])

    const onClickSave = useCallback(async () => {
        await onSave({ name: title, content, isVisible: aiAgentEnabled })
        setGuidanceMode('read')
    }, [onSave, title, content, aiAgentEnabled])

    const onClickCancel = useCallback(() => {
        if (hasContentChanged) {
            onChangeTitle(initialTitle)
            onChangeContent(initialContent)
        } else {
            onClose()
        }
    }, [
        hasContentChanged,
        initialTitle,
        initialContent,
        onChangeTitle,
        onChangeContent,
        onClose,
    ])

    const onClickCreate = useCallback(async () => {
        const response = await onCreate({
            name: title,
            content,
            isVisible: aiAgentEnabled,
        })
        if (response) {
            setGuidanceMode('read')
        }
    }, [onCreate, title, content, aiAgentEnabled])

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
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                title="Guidance"
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onClose={onClose}
                isDetailsView={isDetailsView}
                onToggleDetailsView={onToggleDetailsView}
                disabled={isGuidanceArticleUpdating}
            >
                <KnowledgeEditorTopBarGuidanceControls
                    {...mode}
                    disabled={isGuidanceArticleUpdating}
                />
            </KnowledgeEditorTopBar>

            <div className={css.knowledgeEditor}>
                {guidanceMode === 'read' && (
                    <KnowledgeEditorGuidanceReadView
                        content={content}
                        title={title}
                        availableActions={availableActions}
                        availableVariables={availableVariables}
                    />
                )}

                {guidanceMode === 'edit' && (
                    <KnowledgeEditorGuidanceEditView
                        content={content}
                        title={title}
                        onChangeContent={onChangeContent}
                        onChangeTitle={onChangeTitle}
                        shopName={shopName}
                        availableActions={availableActions}
                        availableVariables={availableVariables}
                    />
                )}

                {guidanceMode === 'create' && (
                    <KnowledgeEditorGuidanceCreateView
                        content={content}
                        title={title}
                        onChangeContent={onChangeContent}
                        onChangeTitle={onChangeTitle}
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
    )
}
