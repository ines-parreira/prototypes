import React from 'react'
import {LocaleCode} from 'models/helpCenter/types'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from '../common/components/AutomateView'
import {useGuidanceArticle} from './hooks/useGuidanceArticle'
import {
    GuidanceForm,
    GuidanceFormFields,
} from './components/GuidanceForm/GuidanceForm'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {GuidanceBreadcrumbs} from './components/GuidanceBreadcrumbs/GuidanceBreadcrumbs'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'

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
    const {headerNavbarItems} = useAiAgentNavigation({shopName})
    const {guidanceArticle} = useGuidanceArticle({
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

    if (!guidanceArticle) {
        return <Loader data-testid="article-loader" />
    }

    const initialFields = {
        name: guidanceArticle.title,
        content: guidanceArticle.content,
    }

    return (
        <AutomateView
            title={
                <GuidanceBreadcrumbs
                    shopName={shopName}
                    title={guidanceArticle.title}
                />
            }
            headerNavbarItems={headerNavbarItems}
        >
            <GuidanceForm
                actionType="update"
                shopName={shopName}
                initialFields={initialFields}
                onSubmit={onSubmit}
                onDelete={onDelete}
                isLoading={isGuidanceArticleUpdating}
            />
        </AutomateView>
    )
}
