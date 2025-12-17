import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useResourceMetrics } from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

import type { MetricProps } from '../../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { useArticleContext } from '../context'

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

    const resourceImpact = useResourceMetrics({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled && !!state.article,
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
