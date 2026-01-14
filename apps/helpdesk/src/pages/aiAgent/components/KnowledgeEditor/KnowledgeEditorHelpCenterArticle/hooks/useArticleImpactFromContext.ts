import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import type { MetricProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { getTimezone } from 'state/currentUser/selectors'

export type ArticleImpactData = {
    tickets?: MetricProps | null
    handoverTickets?: MetricProps | null
    csat?: MetricProps | null
    intents?: string[] | null
    isLoading: boolean
}

export const useArticleImpactFromContext = ():
    | ArticleImpactData
    | undefined => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    // Calculate date range once to ensure consistency
    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    const resourceImpact = useResourceMetrics({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        shopIntegrationId: helpCenter.shop_integration_id ?? 0,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled && !!state.article,
        dateRange,
    })

    return useMemo(
        () =>
            isPerformanceStatsEnabled
                ? {
                      tickets: resourceImpact.data?.tickets,
                      handoverTickets: resourceImpact.data?.handoverTickets,
                      csat: resourceImpact.data?.csat,
                      intents: resourceImpact.data?.intents,
                      isLoading: resourceImpact.isLoading,
                  }
                : undefined,
        [isPerformanceStatsEnabled, resourceImpact],
    )
}
