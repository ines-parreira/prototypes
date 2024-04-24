import React from 'react'
import {notify} from 'reapop'
import Loader from 'pages/common/components/Loader/Loader'
import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import {NotificationStatus} from 'state/notifications/types'
import {useGuidanceArticles} from './hooks/useGuidanceArticles'
import {GuidanceEmptyState} from './components/GuidanceEmptyState/GuidanceEmptyState'
import {GuidanceList} from './components/GuidanceList/GuidanceList'
import {GuidanceHeader} from './components/GuidanceHeader/GuidanceHeader'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'

type Props = {
    helpCenterId: number
    shopName: string
}

export const AiAgentGuidanceView = ({helpCenterId, shopName}: Props) => {
    const {
        guidanceArticles,
        isGuidanceArticleListLoading,
        deleteGuidanceArticle,
    } = useGuidanceArticles(helpCenterId)

    const {routes} = useAiAgentNavigation({shopName})

    const dispatch = useAppDispatch()

    const onDelete = async (articleId: number) => {
        try {
            await deleteGuidanceArticle(articleId)
        } catch (err) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article deletion.',
                })
            )
        }
    }

    const onCreateGuidance = () => {
        history.push(routes.newGuidanceArticle)
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
                onCreateGuidance={onCreateGuidance}
                guidanceArticlesLength={guidanceArticles.length}
            />
            <GuidanceList
                guidanceArticles={guidanceArticles}
                onDelete={onDelete}
            />
        </div>
    )
}
