import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {LocaleCode} from 'models/helpCenter/types'
import {useGuidanceArticles} from './hooks/useGuidanceArticles'
import {GuidanceEmptyState} from './components/GuidanceEmptyState/GuidanceEmptyState'
import {GuidanceList} from './components/GuidanceList/GuidanceList'
import {GuidanceHeader} from './components/GuidanceHeader/GuidanceHeader'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'

type Props = {
    helpCenterId: number
    locale: LocaleCode
    shopName: string
}

export const AiAgentGuidanceView = ({
    helpCenterId,
    shopName,
    locale,
}: Props) => {
    const {guidanceArticles, isGuidanceArticleListLoading} =
        useGuidanceArticles(helpCenterId)
    const {deleteGuidanceArticle, updateGuidanceArticle} =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: helpCenterId,
        })

    const {routes} = useAiAgentNavigation({shopName})

    const dispatch = useAppDispatch()

    const onDelete = async (articleId: number) => {
        try {
            await deleteGuidanceArticle(articleId)
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Guidance successfully deleted',
                })
            )
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article deletion.',
                })
            )
        }
    }

    const onChangeVisibility = async (
        articleId: number,
        isVisible: boolean
    ) => {
        try {
            await updateGuidanceArticle(
                {visibility: isVisible ? 'PUBLIC' : 'UNLISTED'},
                {articleId, locale}
            )
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article visibility change.',
                })
            )
        }
    }

    const onCreateGuidanceClick = () => {
        history.push(routes.newGuidanceArticle)
    }

    const onCreateFromTemplate = () => {
        history.push(routes.guidanceTemplates)
    }

    const onGuidanceArticleClick = (articleId: number) => {
        history.push(routes.guidanceArticleEdit(articleId))
    }

    if (isGuidanceArticleListLoading) {
        return <Loader />
    }

    const isEmptyState = !guidanceArticles || guidanceArticles.length === 0

    if (isEmptyState) {
        return <GuidanceEmptyState shopName={shopName} />
    }

    return (
        <div>
            <GuidanceHeader
                onCreateGuidanceClick={onCreateGuidanceClick}
                onCreateFromTemplate={onCreateFromTemplate}
                guidanceArticlesLength={guidanceArticles.length}
            />
            <GuidanceList
                guidanceArticles={guidanceArticles}
                onDelete={onDelete}
                onRowClick={onGuidanceArticleClick}
                onChangeVisibility={onChangeVisibility}
            />
        </div>
    )
}
