import { useCallback, useEffect, useState } from 'react'

import { LoadingSpinner, SidePanel } from '@gorgias/axiom'

import {
    ArticleTranslationResponseDto,
    LocaleCode,
} from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { GuidanceArticle, GuidanceFormFields } from 'pages/aiAgent/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'
import { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import {
    BaseProps,
    KnowledgeEditorGuidanceView,
} from './KnowledgeEditorGuidanceView'

const KnowledgeEditorGuidanceStateful = ({
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
}: BaseProps & {
    shopName: string
    guidanceArticle: GuidanceArticle
    availableActions: GuidanceAction[]
    onSave: (
        guidanceArticle: GuidanceFormFields,
    ) => Promise<ArticleTranslationResponseDto | undefined>
    onDelete: () => Promise<void>
    onDuplicate: () => Promise<void>
    isGuidanceArticleUpdating: boolean
}) => {
    const [title, setTitle] = useState(guidanceArticle.title)
    const [content, setContent] = useState(guidanceArticle.content)
    const [guidanceArticleId, setGuidanceArticleId] = useState(
        guidanceArticle.id,
    )

    useEffect(() => {
        if (guidanceArticleId !== guidanceArticle.id) {
            setTitle(guidanceArticle.title)
            setContent(guidanceArticle.content)
            setGuidanceArticleId(guidanceArticle.id)
        }
    }, [guidanceArticle, guidanceArticleId])

    const onSave = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            const response = await onSaveFn(guidanceFormFields)

            if (response) {
                setTitle(response.title)
                setContent(response.content)
            }

            return response
        },
        [onSaveFn],
    )

    const onToggleAIAgentEnabled = useCallback(
        async () =>
            onSaveFn({
                name: title,
                content,
                isVisible:
                    guidanceArticle.visibility === 'PUBLIC' ? false : true,
            }),
        [onSaveFn, title, content, guidanceArticle.visibility],
    )

    return (
        <KnowledgeEditorGuidanceView
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            availableActions={availableActions}
            availableVariables={guidanceVariables}
            onSave={onSave}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            title={title}
            content={content}
            aiAgentEnabled={guidanceArticle.visibility === 'PUBLIC'}
            onToggleAIAgentEnabled={onToggleAIAgentEnabled}
            shopName={shopName}
            createdDatetime={new Date(guidanceArticle.createdDatetime)}
            lastUpdatedDatetime={new Date(guidanceArticle.lastUpdated)}
            onChangeTitle={setTitle}
            onChangeContent={setContent}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            guidanceMode={guidanceMode}
        />
    )
}

const KnowledgeEditorGuidanceLoader = ({
    shopName,
    shopType,
    guidanceArticleId,
    guidanceHelpCenterId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
}: BaseProps & {
    shopType: string
    guidanceArticleId: number
    guidanceHelpCenterId: number
    locale: LocaleCode
}) => {
    const { guidanceArticle, isGuidanceArticleLoading } = useGuidanceArticle({
        guidanceHelpCenterId,
        guidanceArticleId,
        locale,
    })

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const {
        updateGuidanceArticle,
        deleteGuidanceArticle,
        duplicateGuidanceArticle,
        isGuidanceArticleUpdating,
    } = useGuidanceArticleMutation({
        guidanceHelpCenterId,
    })

    const onSave = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            return updateGuidanceArticle(
                mapGuidanceFormFieldsToGuidanceArticle(
                    guidanceFormFields,
                    locale,
                ),
                { articleId: guidanceArticleId, locale },
            )
        },
        [updateGuidanceArticle, guidanceArticleId, locale],
    )

    const onDelete = useCallback(
        () => deleteGuidanceArticle(guidanceArticleId),
        [deleteGuidanceArticle, guidanceArticleId],
    )

    const onDuplicate = useCallback(
        () => duplicateGuidanceArticle(guidanceArticleId, shopName),
        [guidanceArticleId, shopName, duplicateGuidanceArticle],
    )

    if (!guidanceArticle || isGuidanceArticleLoading || isLoadingActions) {
        return <LoadingSpinner size="big" />
    }

    return (
        <KnowledgeEditorGuidanceStateful
            shopName={shopName}
            availableActions={guidanceActions}
            guidanceArticle={guidanceArticle}
            onSave={onSave}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            guidanceMode={guidanceMode}
        />
    )
}

const KnowledgeEditorGuidanceHelpCenterLoader = ({
    shopName,
    shopType,
    guidanceArticleId,
    onClose,
    onClickPrevious,
    onClickNext,
    guidanceMode,
}: BaseProps & {
    shopName: string
    shopType: string
    guidanceArticleId: number
}) => {
    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })

    return (
        <SidePanel isOpen={true} withoutPadding size="xl">
            {guidanceHelpCenter ? (
                <KnowledgeEditorGuidanceLoader
                    shopName={shopName}
                    shopType={shopType}
                    guidanceArticleId={guidanceArticleId}
                    guidanceHelpCenterId={guidanceHelpCenter.id}
                    locale={guidanceHelpCenter.default_locale}
                    onClose={onClose}
                    onClickPrevious={onClickPrevious}
                    onClickNext={onClickNext}
                    guidanceMode={guidanceMode}
                />
            ) : (
                <LoadingSpinner size="big" />
            )}
        </SidePanel>
    )
}

export const KnowledgeEditorGuidance = KnowledgeEditorGuidanceHelpCenterLoader
