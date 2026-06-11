import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import {
    getLast28DaysDateRange,
    useSkillSupportingKnowledgesMetric,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useAppSelector } from 'hooks/useAppSelector'
import { useGetKnowledgeHubArticles } from 'models/helpCenter/queries'
import { useSkillEditorStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import type { KnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { transformKnowledgeHubArticlesToKnowledgeItems } from 'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles'
import {
    getCurrentAccountId,
    getCurrentDomain,
} from 'state/currentAccount/selectors'
import { getTimezone } from 'state/currentUser/selectors'

export type TopSupportingKnowledge = KnowledgeItem & {
    tickets: number
    resourceSourceSetId: number
    coUsedTicketIds: string[]
}

export type UseSkillTopKnowledgesResult = {
    topSupportingKnowledges: TopSupportingKnowledge[]
    isLoading: boolean
    dateRange: { start_datetime: string; end_datetime: string }
    historicalVersionDateRange?: {
        start_datetime: string
        end_datetime: string
    }
}

export const useSkillTopKnowledges = (): UseSkillTopKnowledgesResult => {
    const {
        skillId,
        shopName,
        isUpdating,
        isAutoSaving,
        useSupportingContent,
        shopIntegrationId,
        helpCenterId,
        historicalVersionDateRange,
    } = useSkillEditorStore(
        useShallow((storeState) => ({
            skillId: storeState.state.skill?.id,
            shopName: storeState.config.shopName,
            isUpdating: storeState.state.isUpdating,
            isAutoSaving: storeState.state.isAutoSaving,
            useSupportingContent: storeState.state.useSupportingContent,
            shopIntegrationId:
                storeState.config.helpCenter.shop_integration_id ?? 0,
            helpCenterId: storeState.config.helpCenter.id,
            historicalVersionDateRange:
                storeState.state.historicalVersion?.impactDateRange,
        })),
    )

    const accountId = useAppSelector(getCurrentAccountId)
    const accountDomain = useAppSelector(getCurrentDomain)
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useStoreConfiguration({ shopName, accountDomain })

    const guidanceHelpCenterId = storeConfiguration?.guidanceHelpCenterId
    const snippetHelpCenterId = storeConfiguration?.snippetHelpCenterId
    const faqHelpCenterId = storeConfiguration?.helpCenterId

    const dateRange = useMemo(
        () => historicalVersionDateRange ?? getLast28DaysDateRange(),
        [historicalVersionDateRange],
    )

    const fetchEnabled =
        !isLoadingStoreConfiguration &&
        !isUpdating &&
        !isAutoSaving &&
        !!skillId &&
        !!useSupportingContent &&
        !!shopIntegrationId

    const { coUsedResources, isLoading: isMetricLoading } =
        useSkillSupportingKnowledgesMetric({
            skillId: skillId ?? 0,
            helpCenterId,
            shopIntegrationId,
            timezone,
            dateRange,
            enabled: fetchEnabled,
        })

    const articlesEnabled =
        fetchEnabled && !isMetricLoading && coUsedResources.length > 0

    const { data: articlesData, isInitialLoading: isArticlesLoading } =
        useGetKnowledgeHubArticles(
            {
                account_id: accountId,
                guidance_help_center_id: guidanceHelpCenterId,
                snippet_help_center_id: snippetHelpCenterId,
                faq_help_center_id: faqHelpCenterId,
                exclude_articles_with_intent: true,
            },
            { enabled: articlesEnabled },
        )

    const topSupportingKnowledges = useMemo<TopSupportingKnowledge[]>(() => {
        if (!articlesData?.articles || !coUsedResources.length) return []

        const allKnowledges = transformKnowledgeHubArticlesToKnowledgeItems(
            articlesData.articles,
        )

        const ticketCountById = new Map<string, number>()
        const resourceSourceSetIdById = new Map<string, number>()
        const ticketIdsById = new Map<string, Set<string>>()
        for (const row of coUsedResources) {
            const current = ticketCountById.get(row.resourceSourceId) ?? 0
            ticketCountById.set(row.resourceSourceId, current + row.ticketCount)
            if (!resourceSourceSetIdById.has(row.resourceSourceId)) {
                resourceSourceSetIdById.set(
                    row.resourceSourceId,
                    Number(row.resourceSourceSetId),
                )
            }
            if (row.ticketId) {
                const set =
                    ticketIdsById.get(row.resourceSourceId) ?? new Set<string>()
                set.add(row.ticketId)
                ticketIdsById.set(row.resourceSourceId, set)
            }
        }

        return allKnowledges
            .map((article) => ({
                ...article,
                tickets: ticketCountById.get(article.id) ?? 0,
                resourceSourceSetId:
                    resourceSourceSetIdById.get(article.id) ?? 0,
                coUsedTicketIds: [...(ticketIdsById.get(article.id) ?? [])],
            }))
            .filter((article) => article.tickets > 0)
            .sort((a, b) => b.tickets - a.tickets)
            .slice(0, 3)
    }, [articlesData, coUsedResources])

    return {
        topSupportingKnowledges,
        isLoading: isMetricLoading || isArticlesLoading,
        dateRange,
        historicalVersionDateRange,
    }
}
