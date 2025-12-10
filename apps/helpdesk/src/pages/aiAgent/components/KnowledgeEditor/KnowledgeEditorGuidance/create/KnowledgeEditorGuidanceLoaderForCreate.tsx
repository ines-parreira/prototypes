import { useCallback } from 'react'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useNotify } from 'hooks/useNotify'
import type { LocaleCode } from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceFormFields, GuidanceTemplate } from 'pages/aiAgent/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'

import type { BaseProps } from '../KnowledgeEditorGuidanceView'
import { KnowledgeEditorGuidanceStatefulCreate } from './KnowledgeEditorGuidanceStatefulCreate'

type Props = BaseProps & {
    shopType: string
    guidanceTemplate?: GuidanceTemplate
    guidanceHelpCenterId: number
    locale: LocaleCode
    onArticleCreated: (articleId: number) => void
    onCreateFn?: () => void
    closeHandlerRef: React.MutableRefObject<(() => void) | null>
}

export const KnowledgeEditorGuidanceLoaderForCreate = ({
    shopName,
    shopType,
    guidanceTemplate,
    guidanceHelpCenterId,
    locale,
    onClose,
    onClickPrevious,
    onClickNext,
    onArticleCreated,
    onCreateFn,
    guidanceMode,
    isFullscreen,
    onToggleFullscreen,
    onTest,
    closeHandlerRef,
}: Props) => {
    const { error: notifyError } = useNotify()

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const { createGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId,
        })

    const onCreate = useCallback(
        async (guidanceFormFields: GuidanceFormFields) => {
            try {
                const response = await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        guidanceFormFields,
                        locale,
                        guidanceTemplate
                            ? `template_guidance_${guidanceTemplate.id}`
                            : undefined,
                    ),
                )
                if (response) {
                    onArticleCreated(response.id)
                    onCreateFn?.()
                }
                return response
            } catch {
                notifyError('An error occurred while creating guidance.')
            }
        },
        [
            createGuidanceArticle,
            locale,
            guidanceTemplate,
            onArticleCreated,
            onCreateFn,
            notifyError,
        ],
    )

    if (isLoadingActions) {
        return <LoadingSpinner size="big" />
    }

    return (
        <KnowledgeEditorGuidanceStatefulCreate
            shopName={shopName}
            availableActions={guidanceActions}
            guidanceTemplate={guidanceTemplate}
            onCreate={onCreate}
            isGuidanceArticleUpdating={isGuidanceArticleUpdating}
            onClose={onClose}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            guidanceMode={guidanceMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
            onTest={onTest}
            closeHandlerRef={closeHandlerRef}
        />
    )
}
