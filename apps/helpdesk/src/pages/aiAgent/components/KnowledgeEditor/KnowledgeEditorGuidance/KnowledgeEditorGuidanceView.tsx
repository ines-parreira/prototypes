import { useCallback, useMemo, useState } from 'react'

import {
    ArticleTranslationResponseDto,
    ArticleWithLocalTranslation,
} from 'models/helpCenter/types'
import { GuidanceVariableGroup } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import { KnowledgeEditorGuidanceCreateView } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/KnowledgeEditorGuidanceCreateView'
import { KnowledgeEditorGuidanceEditView } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/KnowledgeEditorGuidanceEditView'
import { KnowledgeEditorGuidanceReadView } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/KnowledgeEditorGuidanceReadView'
import { GuidanceFormFields } from 'pages/aiAgent/types'
import { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { KnowledgeEditorSidePanelGuidance } from '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { KnowledgeEditorTopBar } from '../KnowledgeEditorTopBar/KnowledgeEditorTopBar'
import {
    GuidanceMode,
    KnowledgeEditorTopBarGuidanceControls,
} from '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls'

import css from './KnowledgeEditorGuidanceView.less'

export type BaseProps = {
    shopName: string
    onClose: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    guidanceMode: GuidanceMode['mode']
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
}

export const KnowledgeEditorGuidanceView = ({
    onClose,
    onClickPrevious,
    onClickNext,
    availableActions,
    availableVariables,
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
}: Props) => {
    const [initialTitle] = useState(title)
    const [initialContent] = useState(content)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isDetailsView, setIsDetailsView] = useState(false)
    const [guidanceMode, setGuidanceMode] =
        useState<GuidanceMode['mode']>(initialGuidanceMode)

    const onClickEdit = useCallback(() => {
        setGuidanceMode('edit')
    }, [])

    const onClickSave = useCallback(async () => {
        await onSave({ name: title, content, isVisible: aiAgentEnabled })
        setGuidanceMode('read')
    }, [onSave, title, content, aiAgentEnabled])

    const onClickCancel = useCallback(() => {
        onChangeTitle(initialTitle)
        onChangeContent(initialContent)
    }, [initialTitle, initialContent, onChangeTitle, onChangeContent])

    const onClickCreate = useCallback(async () => {
        await onCreate({ name: title, content, isVisible: aiAgentEnabled })
        setGuidanceMode('read')
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
                        onSave: onClickSave,
                        onCancel: onClickCancel,
                    }
                  : {
                        mode: 'create',
                        onCreate: onClickCreate,
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
        ],
    )

    const onToggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const onToggleDetailsView = () => {
        setIsDetailsView(!isDetailsView)
    }

    return (
        <div>
            <KnowledgeEditorTopBar
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                title="Guidance"
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onClose={onClose}
                isDetailsView={isDetailsView}
                onToggleDetailsView={onToggleDetailsView}
                isUpdating={isGuidanceArticleUpdating}
            >
                <KnowledgeEditorTopBarGuidanceControls
                    mode={mode}
                    isUpdating={isGuidanceArticleUpdating}
                />
            </KnowledgeEditorTopBar>

            <div className={css.knowledgeEditor}>
                {guidanceMode === 'read' && (
                    <KnowledgeEditorGuidanceReadView
                        availableActions={availableActions}
                        availableVariables={availableVariables}
                        content={content}
                        title={title}
                    />
                )}

                {guidanceMode === 'edit' && (
                    <KnowledgeEditorGuidanceEditView
                        availableActions={availableActions}
                        content={content}
                        title={title}
                        onChangeContent={onChangeContent}
                        onChangeTitle={onChangeTitle}
                        shopName={shopName}
                    />
                )}

                {guidanceMode === 'create' && (
                    <KnowledgeEditorGuidanceCreateView
                        availableActions={availableActions}
                        content={content}
                        title={title}
                        onChangeContent={onChangeContent}
                        onChangeTitle={onChangeTitle}
                        shopName={shopName}
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
                        impact={{}}
                        relatedTickets={{}}
                    />
                )}
            </div>
        </div>
    )
}
