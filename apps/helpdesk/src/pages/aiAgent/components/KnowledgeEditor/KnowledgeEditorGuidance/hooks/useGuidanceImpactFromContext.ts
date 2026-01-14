import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import type { MetricProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { getTimezone } from 'state/currentUser/selectors'

import { useGuidanceContext } from '../context'

export type GuidanceImpactData = {
    tickets?: MetricProps | null
    handoverTickets?: MetricProps | null
    csat?: MetricProps | null
    intents?: string[] | null
    isLoading: boolean
}

export const useGuidanceImpactFromContext = ():
    | GuidanceImpactData
    | undefined => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)
    const { guidanceArticle, config } = useGuidanceContext()
    const { guidanceHelpCenter } = config

    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    const resourceImpact = useResourceMetrics({
        resourceSourceId: guidanceArticle?.id ?? 0,
        resourceSourceSetId: guidanceHelpCenter.id,
        shopIntegrationId: guidanceHelpCenter.shop_integration_id ?? 0,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled && !!guidanceArticle,
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
