import React from 'react'
import {notify} from 'reapop'
import {LocaleCode} from 'models/helpCenter/types'
import Loader from 'pages/common/components/Loader/Loader'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
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
    const dispatch = useAppDispatch()
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
        try {
            await deleteGuidanceArticle(guidanceArticleId)
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article deletion.',
                })
            )
        }
    }

    const onSubmit = async ({name, content}: GuidanceFormFields) => {
        try {
            await updateGuidanceArticle(
                {
                    title: name,
                    content,
                    locale,
                },
                {articleId: guidanceArticleId, locale}
            )
        } catch (e) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article creation.',
                })
            )
        }
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
                shopName={shopName}
                initialFields={initialFields}
                onSubmit={onSubmit}
                onDelete={onDelete}
                isLoading={isGuidanceArticleUpdating}
            />
        </AutomateView>
    )
}
