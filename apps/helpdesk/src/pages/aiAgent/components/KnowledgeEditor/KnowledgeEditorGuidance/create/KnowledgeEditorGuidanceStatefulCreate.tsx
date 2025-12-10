import { useCallback, useState } from 'react'

import _noop from 'lodash/noop'

import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import type { GuidanceFormFields, GuidanceTemplate } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { KnowledgeEditorGuidanceView } from '../KnowledgeEditorGuidanceView'
import type { BaseProps } from '../KnowledgeEditorGuidanceView'

type Props = BaseProps & {
    guidanceTemplate?: GuidanceTemplate
    availableActions: GuidanceAction[]
    onCreate: (
        guidanceArticle: GuidanceFormFields,
    ) => Promise<ArticleWithLocalTranslation | undefined>
    isGuidanceArticleUpdating: boolean
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
}

export const KnowledgeEditorGuidanceStatefulCreate = ({
    shopName,
    guidanceTemplate,
    availableActions,
    onCreate: onCreateFn,
    isGuidanceArticleUpdating,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    isFullscreen,
    onToggleFullscreen,
    onTest,
    closeHandlerRef,
}: Props) => {
    const [title, setTitle] = useState(guidanceTemplate?.name || '')
    const [content, setContent] = useState(guidanceTemplate?.content || '')
    const [aiAgentEnabled, setAiAgentEnabled] = useState(true)

    const onCreate = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            const response = await onCreateFn({
                ...guidanceFormFields,
                isVisible: aiAgentEnabled,
            })
            return response
        },
        [onCreateFn, aiAgentEnabled],
    )

    const onToggleAIAgentEnabled = () => {
        setAiAgentEnabled((prev) => !prev)
    }

    return (
        <KnowledgeEditorGuidanceView
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            availableActions={availableActions}
            availableVariables={guidanceVariables}
            onSave={_noop}
            onCreate={onCreate}
            onDelete={_noop}
            onDuplicate={_noop}
            title={title}
            content={content}
            aiAgentEnabled={aiAgentEnabled}
            onToggleAIAgentEnabled={onToggleAIAgentEnabled}
            shopName={shopName}
            onChangeTitle={setTitle}
            onChangeContent={setContent}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
            closeHandlerRef={closeHandlerRef}
        />
    )
}
