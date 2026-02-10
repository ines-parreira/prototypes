import { useMemo } from 'react'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import type { MetricProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'
import { getTimezone } from 'state/currentUser/selectors'

import { useGuidanceContext } from '../context'

export type GuidanceImpactData = {
    tickets?: MetricProps | null
    handoverTickets?: MetricProps | null
    csat?: MetricProps | null
    intents?: string[] | null
    isLoading: boolean
    subtitle: string
}

export const useGuidanceImpactFromContext = (): GuidanceImpactData => {
    const timezone = useAppSelector(getTimezone)
    const { guidanceArticle, config, state } = useGuidanceContext()
    const { guidanceHelpCenter } = config

    // Use historical version's date range if viewing history, otherwise last 28 days
    const dateRange = useMemo(
        () =>
            state.historicalVersion?.impactDateRange ??
            getLast28DaysDateRange(),
        [state.historicalVersion?.impactDateRange],
    )

    const resourceImpact = useResourceMetrics({
        resourceSourceId: guidanceArticle?.id ?? 0,
        resourceSourceSetId: guidanceHelpCenter.id,
        shopIntegrationId: guidanceHelpCenter.shop_integration_id ?? 0,
        timezone: timezone ?? 'UTC',
        enabled: !!guidanceArticle,
        dateRange,
    })

    const subtitle = formatDateRangeSubtitle(
        state.historicalVersion?.impactDateRange,
    )

    return useMemo(
        () => ({
            tickets: resourceImpact.data?.tickets,
            handoverTickets: resourceImpact.data?.handoverTickets,
            csat: resourceImpact.data?.csat,
            intents: resourceImpact.data?.intents,
            isLoading: resourceImpact.isLoading,
            subtitle,
        }),
        [resourceImpact, subtitle],
    )
}
