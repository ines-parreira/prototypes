import { useCallback } from 'react'

import _noop from 'lodash/noop'

import type { ArticleTranslationResponseDto } from 'models/helpCenter/types'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import type { GuidanceArticle, GuidanceFormFields } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import type { Props as ImpactProps } from '../../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorGuidanceView } from '../KnowledgeEditorGuidanceView'
import type { BaseProps } from '../KnowledgeEditorGuidanceView'

type Props = BaseProps & {
    guidanceArticle: GuidanceArticle
    availableActions: GuidanceAction[]
    onSave: (
        guidanceArticle: GuidanceFormFields,
    ) => Promise<ArticleTranslationResponseDto | undefined>
    onDelete: () => Promise<void>
    onDuplicate: () => Promise<void>
    isGuidanceArticleUpdating: boolean
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
    impact?: Omit<ImpactProps, 'sectionId'>
}

export const KnowledgeEditorGuidanceStatefulEdit = ({
    shopName,
    guidanceArticle,
    availableActions,
    onSave: onSaveFn,
    onDelete,
    onDuplicate,
    isGuidanceArticleUpdating,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
    isFullscreen,
    onToggleFullscreen,
    onTest,
    closeHandlerRef,
    impact,
}: Props) => {
    const onSave = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            const response = await onSaveFn(guidanceFormFields)
            return response
        },
        [onSaveFn],
    )

    const onToggleAIAgentEnabled = useCallback(
        async () =>
            onSaveFn({
                name: guidanceArticle.title,
                content: guidanceArticle.content,
                isVisible:
                    guidanceArticle.visibility === 'PUBLIC' ? false : true,
            }),
        [
            onSaveFn,
            guidanceArticle.title,
            guidanceArticle.content,
            guidanceArticle.visibility,
        ],
    )

    return (
        <KnowledgeEditorGuidanceView
            key={`${guidanceArticle.id}-${guidanceArticle.lastUpdated}`}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            availableActions={availableActions}
            availableVariables={guidanceVariables}
            onSave={onSave}
            onCreate={_noop}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            title={guidanceArticle.title}
            content={guidanceArticle.content}
            aiAgentEnabled={guidanceArticle.visibility === 'PUBLIC'}
            onToggleAIAgentEnabled={onToggleAIAgentEnabled}
            shopName={shopName}
            createdDatetime={new Date(guidanceArticle.createdDatetime)}
            lastUpdatedDatetime={new Date(guidanceArticle.lastUpdated)}
            onChangeTitle={_noop}
            onChangeContent={_noop}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
            closeHandlerRef={closeHandlerRef}
            impact={impact}
        />
    )
}
