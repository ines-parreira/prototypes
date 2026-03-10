import React, { useMemo } from 'react'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import type { LocaleCode } from 'models/helpCenter/types'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { GuidanceForm } from './components/GuidanceForm/GuidanceForm'
import { useGuidanceArticle } from './hooks/useGuidanceArticle'
import { useGuidanceArticleMutation } from './hooks/useGuidanceArticleMutation'
import type { GuidanceFormFields } from './types'
import { mapGuidanceFormFieldsToGuidanceArticle } from './utils/guidance.utils'

import css from './AiAgentGuidanceContainer.less'

type Props = {
    guidanceHelpCenterId: number
    guidanceArticleId: number
    locale: LocaleCode
    shopName: string
    shopType: string
}

export const AiAgentGuidanceDetailView = ({
    guidanceHelpCenterId,
    guidanceArticleId,
    shopName,
    locale,
    shopType,
}: Props) => {
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
        isGuidanceArticleUpdating,
    } = useGuidanceArticleMutation({
        guidanceHelpCenterId,
    })

    const onDelete = async () => {
        await deleteGuidanceArticle(guidanceArticleId)
    }

    const onSubmit = async (guidanceFormFields: GuidanceFormFields) => {
        await updateGuidanceArticle(
            mapGuidanceFormFieldsToGuidanceArticle(guidanceFormFields, locale),
            { articleId: guidanceArticleId, locale },
        )
    }

    const initialFields = useMemo(
        () =>
            guidanceArticle
                ? {
                      name: guidanceArticle.title,
                      content: guidanceArticle.content,
                      isVisible:
                          guidanceArticle.visibility ===
                          VisibilityStatusEnum.PUBLIC,
                  }
                : undefined,
        [guidanceArticle],
    )

    const sourceType = useMemo(() => {
        const templateKey = guidanceArticle?.templateKey

        if (templateKey?.includes('ai_guidance')) return 'ai'
        if (templateKey?.includes('template_guidance')) return 'template'

        return 'scratch'
    }, [guidanceArticle])

    if (!guidanceArticle || isLoadingActions) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentLayout shopName={shopName} title={'Knowledge'}>
            <GuidanceForm
                actionType="update"
                availableActions={guidanceActions}
                shopName={shopName}
                initialFields={initialFields}
                onSubmit={onSubmit}
                onDelete={onDelete}
                isLoading={
                    isGuidanceArticleUpdating || isGuidanceArticleLoading
                }
                sourceType={sourceType}
                helpCenterId={guidanceHelpCenterId}
            />
        </AiAgentLayout>
    )
}
