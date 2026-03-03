import React, { useEffect, useState } from 'react'

import { useDebouncedValue } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import type { LocaleCode } from 'models/helpCenter/types'
import type { StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useSelfServiceStoreIntegration from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
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

    const [search, setSearch] = useState('')

    const debouncedSearch = useDebouncedValue(search, 500)

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
        query: debouncedSearch,
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
        } catch (error) {
            /* istanbul ignore next */
            const isDuplicateError =
                isGorgiasApiError(error) &&
                error.response?.data.error.msg &&
                error.response.data.error.msg.includes('already exists')
            /* istanbul ignore next */
            const message = isDuplicateError
                ? error.response?.data.error.msg
                : 'Error during guidance article duplication.'
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: message,
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

    const isLoading =
        isLoadingGuidanceArticleList ||
        (!guidanceArticles.length && isLoadingAiGuidances)

    if (isEmptyStateNoAIGuidances && !isLoading && !debouncedSearch) {
        return <GuidanceEmptyState shopName={shopName} />
    }

    if (isEmptyStateAIGuidances && !isLoading && !debouncedSearch) {
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
                onSearch={setSearch}
                searchQuery={search}
            />
            <GuidanceTopRecommendations
                isLoading={isLoadingAiGuidances}
                aiGuidances={guidanceAISuggestions}
                shopName={shopName}
            />

            <GuidanceList
                guidanceArticles={guidanceArticles}
                isLoading={isLoading}
                currentStoreIntegrationId={storeIntegration?.id}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onRowClick={onGuidanceArticleClick}
                onChangeVisibility={onChangeVisibility}
                shopName={shopName}
                shopType={shopType}
                onSearch={setSearch}
            />
        </div>
    )
}
