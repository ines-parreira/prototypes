import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import type { MetricProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'
import { getTimezone } from 'state/currentUser/selectors'

import { useGuidanceStore } from '../context'

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
    const {
        guidanceArticleId,
        guidanceHelpCenterId,
        shopIntegrationId,
        impactDateRange,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceArticleId: storeState.guidanceArticle?.id,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter.id,
            shopIntegrationId:
                storeState.config.guidanceHelpCenter.shop_integration_id ?? 0,
            impactDateRange:
                storeState.state.historicalVersion?.impactDateRange,
        })),
    )

    // Use historical version's date range if viewing history, otherwise last 28 days
    const dateRange = useMemo(
        () => impactDateRange ?? getLast28DaysDateRange(),
        [impactDateRange],
    )

    const resourceImpact = useResourceMetrics({
        resourceSourceId: guidanceArticleId ?? 0,
        resourceSourceSetId: guidanceHelpCenterId,
        shopIntegrationId,
        timezone: timezone ?? 'UTC',
        enabled: !!guidanceArticleId,
        dateRange,
    })

    const subtitle = formatDateRangeSubtitle(impactDateRange)

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
