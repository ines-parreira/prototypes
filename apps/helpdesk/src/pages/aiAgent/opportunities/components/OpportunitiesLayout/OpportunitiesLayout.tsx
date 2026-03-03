import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useAiAgentHelpCenter } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'
import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useOpportunityPageState } from 'pages/aiAgent/opportunities/hooks/useOpportunityPageState'
import type {
    OpportunityConfig,
    SidebarOpportunityItem,
} from 'pages/aiAgent/opportunities/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getViewLanguage } from 'state/ui/helpCenter'

import OpportunitiesSidebarContext from '../../context/OpportunitiesSidebarContext'
import { useKnowledgeServiceOpportunities } from '../../hooks/useKnowledgeServiceOpportunities'
import { useOpportunitiesTracking } from '../../hooks/useOpportunitiesTracking'
import { useSelectedOpportunity } from '../../hooks/useSelectedOpportunity'
import { OpportunitiesContent } from '../OpportunitiesContent/OpportunitiesContent'
import { OpportunitiesSidebar } from '../OpportunitiesSidebar/OpportunitiesSidebar'

import css from './OpportunitiesLayout.less'

const PRELOAD_THRESHOLD = 5

export const OpportunitiesLayout = () => {
    const { shopName, shopType, opportunityId } = useParams<{
        shopName: string
        shopType: string
        opportunityId?: string
    }>()

    const [isSidebarVisible, setIsSidebarVisible] = useState(true)
    const wrapperRef = useRef<HTMLDivElement>(null)

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

    const {
        opportunities: knowledgeServiceOpportunities,
        isLoading: isLoadingKnowledgeService,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        preloadNextPage,
        refetch: refetchOpportunities,
        allowedOpportunityIds,
    } = useKnowledgeServiceOpportunities(
        shopIntegrationId || 0,
        useKnowledgeService,
    )

    const opportunities: SidebarOpportunityItem[] =
        knowledgeServiceOpportunities

    const {
        selectedOpportunity,
        setSelectedOpportunityId,
        isLoading: isLoadingOpportunityDetails,
    } = useSelectedOpportunity({
        shopIntegrationId: shopIntegrationId || 0,
        opportunities,
        useKnowledgeService,
        initialOpportunityId: opportunityId,
        allowedOpportunityIds: useKnowledgeService
            ? allowedOpportunityIds
            : undefined,
        shopType: shopType ?? '',
        shopName: shopName ?? '',
    })

    const { currentState: opportunityPageState, stateConfig } =
        useOpportunityPageState({
            helpCenterId: storeConfiguration?.helpCenterId ?? 0,
            locale,
            shopName: shopName ?? '',
            accountId,
            shopType: shopType ?? '',
            allowedOpportunityIds: useKnowledgeService
                ? allowedOpportunityIds
                : undefined,
        })

    const {
        onOpportunityPageVisited,
        onOpportunityViewed,
        onOpportunityAccepted,
        onOpportunityDismissed,
    } = useOpportunitiesTracking()

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
        // Only for knowledge service with pagination (premium users only)
        if (
            useKnowledgeService &&
            allowedOpportunityIds === undefined &&
            opportunities.length - index <= PRELOAD_THRESHOLD
        ) {
            preloadNextPage()
        }
    }

    const handleArchiveArticle = async (articleKey: string) => {
        await refetchOpportunities()
        selectNextOpportunity(articleKey)
    }

    const handlePublishArticle = async (articleKey: string) => {
        await refetchOpportunities()
        selectNextOpportunity(articleKey)
    }

    useEffect(() => {
        onOpportunityPageVisited()
    }, [onOpportunityPageVisited])

    useLayoutEffect(() => {
        if (!wrapperRef.current) return

        const resizeObserver = new ResizeObserver(() => {
            if (window.innerWidth >= 1220) {
                setIsSidebarVisible(true)
            } else {
                setIsSidebarVisible(false)
            }
        })

        resizeObserver.observe(wrapperRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    const isLoading = isStoreConfigLoading || isLoadingKnowledgeService

    const opportunityConfig: OpportunityConfig = {
        shopName,
        shopIntegrationId,
        helpCenterId: storeConfiguration?.helpCenterId ?? 0,
        guidanceHelpCenterId: guidanceHelpCenter?.id ?? 0,
        useKnowledgeService,
        onArchive: handleArchiveArticle,
        onPublish: handlePublishArticle,
        onOpportunityAccepted,
        onOpportunityDismissed,
    }

    return (
        <OpportunitiesSidebarContext.Provider
            value={{ isSidebarVisible, setIsSidebarVisible }}
        >
            <div className={css.wrapper} data-ai-opportunities ref={wrapperRef}>
                <div
                    className={classNames(css.layout, {
                        [css.layoutNoGap]: !isSidebarVisible,
                    })}
                >
                    <OpportunitiesSidebar
                        isLoading={isLoading}
                        opportunitiesPageState={opportunityPageState}
                        opportunities={opportunities}
                        onSelectOpportunity={(opp) => {
                            if (opp) {
                                setSelectedOpportunityId(opp.id)
                            }
                        }}
                        selectedOpportunity={selectedOpportunity}
                        onOpportunityViewed={onOpportunityViewed}
                        hasNextPage={
                            useKnowledgeService &&
                            allowedOpportunityIds === undefined
                                ? hasNextPage
                                : false
                        }
                        isFetchingNextPage={
                            useKnowledgeService &&
                            allowedOpportunityIds === undefined
                                ? isFetchingNextPage
                                : false
                        }
                        onEndReached={
                            useKnowledgeService &&
                            allowedOpportunityIds === undefined
                                ? fetchNextPage
                                : undefined
                        }
                        allowedOpportunityIds={
                            useKnowledgeService
                                ? allowedOpportunityIds
                                : undefined
                        }
                    />
                    <OpportunitiesContent
                        key={selectedOpportunity?.key}
                        opportunitiesPageState={opportunityPageState}
                        selectedOpportunity={selectedOpportunity ?? null}
                        opportunityConfig={opportunityConfig}
                        opportunities={opportunities}
                        selectCertainOpportunity={selectCertainOpportunity}
                        isLoadingOpportunityDetails={
                            isLoadingOpportunityDetails
                        }
                        totalCount={opportunities.length}
                        allowedOpportunityIds={
                            useKnowledgeService
                                ? allowedOpportunityIds
                                : undefined
                        }
                        stateConfig={stateConfig}
                    />
                </div>
            </div>
        </OpportunitiesSidebarContext.Provider>
    )
}
