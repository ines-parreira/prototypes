import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { getViewLanguage } from 'state/ui/helpCenter'

import OpportunitiesSidebarContext from '../../context/OpportunitiesSidebarContext'
import { useKnowledgeServiceOpportunities } from '../../hooks/useKnowledgeServiceOpportunities'
import { useOpportunitiesTracking } from '../../hooks/useOpportunitiesTracking'
import { useSelectedOpportunity } from '../../hooks/useSelectedOpportunity'
import type { SidebarOpportunityItem } from '../../types'
import { mapAiArticlesToOpportunities } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunitiesContent } from '../OpportunitiesContent/OpportunitiesContent'
import { OpportunitiesSidebar } from '../OpportunitiesSidebar/OpportunitiesSidebar'

import css from './OpportunitiesLayout.less'

const PRELOAD_THRESHOLD = 5

export const OpportunitiesLayout = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    const [isSidebarVisible, setIsSidebarVisible] = useState(true)

    const { storeConfiguration, isLoading: isStoreConfigLoading } =
        useAiAgentStoreConfigurationContext()

    const guidanceHelpCenter = useAiAgentHelpCenter({
        helpCenterType: 'guidance',
        shopName,
    })
    const shopIntegrationId = useShopIntegrationId(shopName)

    const useKnowledgeService = useFlag(
        FeatureFlagKey.OpportunitiesMilestone2,
        false,
    )

    const { setIsCollapsibleColumnOpen } = useCollapsibleColumn()
    useEffectOnce(() => {
        // replicates the behavior of AiAgentLayout
        setIsCollapsibleColumnOpen(false)
    })

    const locale = useAppSelector(getViewLanguage) || HELP_CENTER_DEFAULT_LOCALE
    const accountId = useAppSelector(getCurrentAccountId)
    const userId = useAppSelector(getCurrentUserId)

    const {
        articles: aiArticles,
        isLoading: isLoadingAiArticles,
        markArticleAsReviewed,
    } = useHelpCenterAIArticlesLibrary(
        storeConfiguration?.helpCenterId ?? 0,
        locale,
        shopName,
        !useKnowledgeService,
    )

    const {
        opportunities: knowledgeServiceOpportunities,
        isLoading: isLoadingKnowledgeService,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        preloadNextPage,
        totalCount,
        totalPending,
        refetch: refetchOpportunities,
    } = useKnowledgeServiceOpportunities(
        shopIntegrationId || 0,
        useKnowledgeService,
    )

    const {
        onOpportunityPageVisited,
        onOpportunityViewed,
        onOpportunityAccepted,
        onOpportunityDismissed,
    } = useOpportunitiesTracking({
        accountId,
        userId,
    })

    const opportunities: SidebarOpportunityItem[] = useMemo(() => {
        if (useKnowledgeService) {
            return knowledgeServiceOpportunities
        }
        if (!storeConfiguration?.helpCenterId) return []
        return mapAiArticlesToOpportunities(aiArticles)
    }, [
        aiArticles,
        knowledgeServiceOpportunities,
        storeConfiguration?.helpCenterId,
        useKnowledgeService,
    ])

    const {
        selectedOpportunity,
        setSelectedOpportunityId,
        isLoading: isLoadingOpportunityDetails,
    } = useSelectedOpportunity(
        shopIntegrationId || 0,
        opportunities,
        useKnowledgeService,
    )

    const selectNextOpportunity = (articleKey: string) => {
        if (selectedOpportunity?.key === articleKey) {
            const remainingOpportunities = opportunities.filter(
                (opp) => opp.key !== articleKey,
            )
            setSelectedOpportunityId(remainingOpportunities[0]?.id || null)
        }
    }

    const selectCertainOpportunity = (index: number) => {
        if (index < 0 || index >= opportunities.length) {
            return
        }

        setSelectedOpportunityId(opportunities[index].id)

        // Preload next page if we're close to the end
        // Only for knowledge service with pagination
        if (
            useKnowledgeService &&
            opportunities.length - index <= PRELOAD_THRESHOLD
        ) {
            preloadNextPage()
        }
    }

    const handleArchiveArticle = async (articleKey: string) => {
        if (!useKnowledgeService) {
            markArticleAsReviewed(articleKey, 'archive')
        } else {
            await refetchOpportunities()
        }

        selectNextOpportunity(articleKey)
    }

    const handlePublishArticle = async (articleKey: string) => {
        if (!useKnowledgeService) {
            markArticleAsReviewed(articleKey, 'publish')
        } else {
            await refetchOpportunities()
        }

        selectNextOpportunity(articleKey)
    }

    const isLoading =
        isStoreConfigLoading ||
        (useKnowledgeService ? isLoadingKnowledgeService : isLoadingAiArticles)

    useEffect(() => {
        onOpportunityPageVisited()
    }, [onOpportunityPageVisited])

    return (
        <OpportunitiesSidebarContext.Provider
            value={{ isSidebarVisible, setIsSidebarVisible }}
        >
            <div className={css.wrapper} data-ai-opportunities>
                <div className={css.layout}>
                    {isSidebarVisible && (
                        <OpportunitiesSidebar
                            opportunities={opportunities}
                            isLoading={isLoading}
                            onSelectOpportunity={(opp) => {
                                if (opp) {
                                    setSelectedOpportunityId(opp.id)
                                }
                            }}
                            selectedOpportunity={selectedOpportunity}
                            onOpportunityViewed={onOpportunityViewed}
                            hasNextPage={
                                useKnowledgeService ? hasNextPage : false
                            }
                            isFetchingNextPage={
                                useKnowledgeService ? isFetchingNextPage : false
                            }
                            onEndReached={
                                useKnowledgeService ? fetchNextPage : undefined
                            }
                            totalCount={
                                useKnowledgeService ? totalCount : undefined
                            }
                            totalPending={
                                useKnowledgeService ? totalPending : undefined
                            }
                        />
                    )}
                    <OpportunitiesContent
                        key={selectedOpportunity?.key}
                        selectedOpportunity={selectedOpportunity ?? null}
                        shopName={shopName}
                        shopIntegrationId={shopIntegrationId}
                        helpCenterId={storeConfiguration?.helpCenterId ?? 0}
                        guidanceHelpCenterId={guidanceHelpCenter?.id ?? 0}
                        onArchive={handleArchiveArticle}
                        onPublish={handlePublishArticle}
                        markArticleAsReviewed={markArticleAsReviewed}
                        opportunities={opportunities}
                        selectCertainOpportunity={selectCertainOpportunity}
                        onOpportunityAccepted={onOpportunityAccepted}
                        onOpportunityDismissed={onOpportunityDismissed}
                        useKnowledgeService={useKnowledgeService}
                        isLoadingOpportunityDetails={
                            isLoadingOpportunityDetails
                        }
                        totalCount={opportunities.length}
                    />
                </div>
            </div>
        </OpportunitiesSidebarContext.Provider>
    )
}
