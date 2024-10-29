import React, {useMemo} from 'react'

import {LocaleCode} from 'models/helpCenter/types'

import Spinner from 'pages/common/components/Spinner'

import css from './AiAgentGuidanceContainer.less'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import {GuidanceForm} from './components/GuidanceForm/GuidanceForm'
import {useGuidanceArticle} from './hooks/useGuidanceArticle'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {GuidanceFormFields} from './types'
import {mapGuidanceFormFieldsToGuidanceArticle} from './utils/guidance.utils'

type Props = {
    guidanceHelpCenterId: number
    guidanceArticleId: number
    locale: LocaleCode
    shopName: string
}

export const AiAgentGuidanceDetailView = ({
    guidanceHelpCenterId,
    guidanceArticleId,
    shopName,
    locale,
}: Props) => {
    const {guidanceArticle, isGuidanceArticleLoading} = useGuidanceArticle({
        guidanceHelpCenterId,
        guidanceArticleId,
        locale,
    })
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
            {articleId: guidanceArticleId, locale}
        )
    }

    const initialFields = useMemo(
        () =>
            guidanceArticle
                ? {
                      name: guidanceArticle.title,
                      content: guidanceArticle.content,
                      isVisible: guidanceArticle.visibility === 'PUBLIC',
                  }
                : undefined,
        [guidanceArticle]
    )

    const sourceType = useMemo(() => {
        const templateKey = guidanceArticle?.templateKey

        if (templateKey?.includes('ai_guidance')) return 'ai'
        if (templateKey?.includes('template_guidance')) return 'template'

        return 'scratch'
    }, [guidanceArticle])

    if (!guidanceArticle) {
        return (
            <div className={css.spinner}>
                <Spinner size="big" />
            </div>
        )
    }

    return (
        <AiAgentLayout
            shopName={shopName}
            title={
                <GuidanceBreadcrumbs
                    shopName={shopName}
                    title={guidanceArticle.title}
                />
            }
        >
            <GuidanceForm
                actionType="update"
                shopName={shopName}
                initialFields={initialFields}
                onSubmit={onSubmit}
                onDelete={onDelete}
                isLoading={
                    isGuidanceArticleUpdating || isGuidanceArticleLoading
                }
                sourceType={sourceType}
            />
        </AiAgentLayout>
    )
}
