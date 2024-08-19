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
        isLoading,
        isEmptyStateNoAIGuidances,
        isEmptyStateAIGuidances,
        isGuidancesOnly,
    } = useGuidanceAiSuggestions({
        helpCenterId,
        shopName,
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

    if (isLoading) {
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
    if (isGuidancesOnly) {
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

    return null
}
