import { useMemo } from 'react'

import {
    getLast28DaysDateRange,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import type { MetricProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionImpact'
import { formatDateRangeSubtitle } from 'pages/aiAgent/components/KnowledgeEditor/shared/useVersionHistoryBase/useVersionHistoryBase'
import { getTimezone } from 'state/currentUser/selectors'

export type ArticleImpactData = {
    tickets?: MetricProps | null
    handoverTickets?: MetricProps | null
    csat?: MetricProps | null
    intents?: string[] | null
    isLoading: boolean
    subtitle: string
}

export const useArticleImpactFromContext = (): ArticleImpactData => {
    const timezone = useAppSelector(getTimezone)
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    // Use historical version's date range if viewing history, otherwise last 28 days
    const dateRange = useMemo(
        () =>
            state.historicalVersion?.impactDateRange ??
            getLast28DaysDateRange(),
        [state.historicalVersion?.impactDateRange],
    )

    const resourceImpact = useResourceMetrics({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        shopIntegrationId: helpCenter.shop_integration_id ?? 0,
        timezone: timezone ?? 'UTC',
        enabled: !!state.article,
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
            intents: resourceImpact.data?.intents?.map(({ intent }) => intent),
            isLoading: resourceImpact.isLoading,
            subtitle,
        }),
        [resourceImpact, subtitle],
    )
}
