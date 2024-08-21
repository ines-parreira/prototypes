import React from 'react'
import Loader from 'pages/common/components/Loader/Loader'
import useAppDispatch from 'hooks/useAppDispatch'
import history from 'pages/history'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {LocaleCode} from 'models/helpCenter/types'
import {GuidanceEmptyState} from './components/GuidanceEmptyState/GuidanceEmptyState'
import {GuidanceList} from './components/GuidanceList/GuidanceList'
import {GuidanceHeader} from './components/GuidanceHeader/GuidanceHeader'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGuidanceArticleMutation} from './hooks/useGuidanceArticleMutation'
import {useGuidanceAiSuggestions} from './hooks/useGuidanceAiSuggestions'
import {DATA_TEST_ID} from './constants'
import AiGuidanceEmptyState from './components/AiGuidanceEmptyState/AiGuidanceEmptyState'
import {GuidanceTopRecommendations} from './components/GuidanceTopRecommendations/GuidanceTopRecommendations'

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
    const {deleteGuidanceArticle, updateGuidanceArticle} =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: helpCenterId,
        })

    const {
        guidanceArticles,
        guidanceAISuggestions,
        isLoadingAiGuidances,
        isLoadingGuidanceArticleList,
        isEmptyStateNoAIGuidances,
        isEmptyStateAIGuidances,
        isGuidancesAndAIGuidances,
        invalidateAiGuidances,
    } = useGuidanceAiSuggestions({
        helpCenterId,
        shopName,
    })

    const {routes} = useAiAgentNavigation({shopName})

    const dispatch = useAppDispatch()

    const onDelete = async (articleId: number) => {
        try {
            await deleteGuidanceArticle(articleId)
            await invalidateAiGuidances()
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

    const onBrowseSuggestions = () => {
        history.push(routes.guidanceLibrary)
    }

    if (
        isLoadingGuidanceArticleList ||
        (!guidanceArticles.length && isLoadingAiGuidances)
    ) {
        return <Loader data-testid={DATA_TEST_ID.Loader} />
    }

    if (isEmptyStateNoAIGuidances) {
        return (
            <div data-testid={DATA_TEST_ID.EmptyStateNoAIGuidances}>
                <GuidanceEmptyState shopName={shopName} />
            </div>
        )
    }

    if (isEmptyStateAIGuidances) {
        return (
            <AiGuidanceEmptyState
                aiGuidances={guidanceAISuggestions}
                shopName={shopName}
            />
        )
    }

    return (
        <div>
            <GuidanceHeader
                onCreateGuidanceClick={onCreateGuidanceClick}
                onCreateFromTemplate={onCreateFromTemplate}
                onBrowseSuggestions={onBrowseSuggestions}
                guidanceArticlesLength={guidanceArticles.length}
                hasAiGuidanceSuggestions={isGuidancesAndAIGuidances}
                isLoading={isLoadingAiGuidances}
            />
            <GuidanceTopRecommendations
                isLoading={isLoadingAiGuidances}
                aiGuidances={guidanceAISuggestions}
                shopName={shopName}
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
