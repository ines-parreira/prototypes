import React, { useEffect } from 'react'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import { LocaleCode } from 'models/helpCenter/types'
import { StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import AiGuidanceEmptyState from './components/AiGuidanceEmptyState/AiGuidanceEmptyState'
import { GuidanceEmptyState } from './components/GuidanceEmptyState/GuidanceEmptyState'
import { GuidanceHeader } from './components/GuidanceHeader/GuidanceHeader'
import { GuidanceList } from './components/GuidanceList/GuidanceList'
import { GuidanceTopRecommendations } from './components/GuidanceTopRecommendations/GuidanceTopRecommendations'
import { useAiAgentNavigation } from './hooks/useAiAgentNavigation'
import { useGuidanceAiSuggestions } from './hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from './hooks/useGuidanceArticleMutation'

import css from './AiAgentGuidanceView.less'

type Props = {
    helpCenterId: number
    locale: LocaleCode
    shopName: string
    shopType: string
}

export const AiAgentGuidanceView = ({
    helpCenterId,
    shopName,
    locale,
    shopType,
}: Props) => {
    const {
        deleteGuidanceArticle,
        updateGuidanceArticle,
        duplicateGuidanceArticle,
    } = useGuidanceArticleMutation({
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

    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)

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

    const { routes } = useAiAgentNavigation({ shopName })

    const dispatch = useAppDispatch()

    const onDelete = async (articleId: number) => {
        try {
            await deleteGuidanceArticle(articleId)
            await invalidateAiGuidances()
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Guidance successfully deleted',
                }),
            )
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article deletion.',
                }),
            )
        }
    }

    const onDuplicate = async (
        articleId: number,
        storeIntegration: StoreIntegration,
    ) => {
        try {
            const message = `Successfully duplicated to <br />
<a href='/app/ai-agent/${
                storeIntegration.type
            }/${getShopNameFromStoreIntegration(storeIntegration)}/knowledge/guidance'>${
                storeIntegration.name
            }</a>`
            await duplicateGuidanceArticle(articleId, storeIntegration.name)
            await invalidateAiGuidances()
            void dispatch(
                notify({
                    allowHTML: true,
                    status: NotificationStatus.Success,
                    message,
                }),
            )
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article duplication.',
                }),
            )
        }
    }

    const onChangeVisibility = async (
        articleId: number,
        isVisible: boolean,
    ) => {
        try {
            await updateGuidanceArticle(
                { visibility: isVisible ? 'PUBLIC' : 'UNLISTED' },
                { articleId, locale },
            )
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during guidance article visibility change.',
                }),
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
                <LoadingSpinner size="big" />
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
                currentStoreIntegrationId={storeIntegration?.id}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onRowClick={onGuidanceArticleClick}
                onChangeVisibility={onChangeVisibility}
            />
        </div>
    )
}
