import React, {useMemo} from 'react'
import {LocaleCode} from 'models/helpCenter/types'
import Loader from 'pages/common/components/Loader/Loader'
import {useGuidanceArticle} from './hooks/useGuidanceArticle'
import {
    GuidanceForm,
    GuidanceFormFields,
} from './components/GuidanceForm/GuidanceForm'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import {AiAgentLayout} from './components/AiAgentLayout/AiAgentLayout'

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

    const onSubmit = async ({name, content}: GuidanceFormFields) => {
        await updateGuidanceArticle(
            {
                title: name,
                content,
                locale,
            },
            {articleId: guidanceArticleId, locale}
        )
    }

    const initialFields = useMemo(
        () =>
            guidanceArticle
                ? {
                      name: guidanceArticle.title,
                      content: guidanceArticle.content,
                  }
                : undefined,
        [guidanceArticle]
    )

    if (!guidanceArticle) {
        return <Loader data-testid="article-loader" />
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
            />
        </AiAgentLayout>
    )
}
