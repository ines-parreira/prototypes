import React, {useEffect} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import {LocaleCode} from 'models/helpCenter/types'
import Spinner from 'pages/common/components/Spinner'
import history from 'pages/history'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from './AiAgentGuidanceView.less'
import AiGuidanceEmptyState from './components/AiGuidanceEmptyState/AiGuidanceEmptyState'
import {GuidanceEmptyState} from './components/GuidanceEmptyState/GuidanceEmptyState'
import {GuidanceHeader} from './components/GuidanceHeader/GuidanceHeader'
import {GuidanceList} from './components/GuidanceList/GuidanceList'
import {GuidanceTopRecommendations} from './components/GuidanceTopRecommendations/GuidanceTopRecommendations'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGuidanceAiSuggestions} from './hooks/useGuidanceAiSuggestions'
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

    useEffect(() => {
        if (isLoadingAiGuidances) return
        logEvent(SegmentEvent.AiAgentGuidancePageViewed, {
            empty: isEmptyStateNoAIGuidances || isEmptyStateAIGuidances,
        })
    }, [
        isLoadingAiGuidances,
        isEmptyStateNoAIGuidances,
        isEmptyStateAIGuidances,
    ])

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
        logEvent(SegmentEvent.AiAgentGuidanceLibraryViewed, {
            source: 'browse_suggestions',
        })
        history.push(routes.guidanceLibrary)
    }

    if (
        isLoadingGuidanceArticleList ||
        (!guidanceArticles.length && isLoadingAiGuidances)
    ) {
        return (
            <div className={css.spinner}>
                <Spinner size="big" />
            </div>
        )
    }

    if (isEmptyStateNoAIGuidances) {
        return <GuidanceEmptyState shopName={shopName} />
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
