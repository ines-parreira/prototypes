import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    getLast28DaysDateRange,
    useRelatedTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import type { Props as HelpCenterArticleRelatedTicketsProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionRelatedTickets'
import { getTimezone } from 'state/currentUser/selectors'

export type ArticleRelatedTicketsData = Omit<
    HelpCenterArticleRelatedTicketsProps,
    'sectionId'
>

export const useArticleRelatedTicketsFromContext = ():
    | ArticleRelatedTicketsData
    | undefined => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    // Calculate date range once to ensure consistency
    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    // Get resource metrics to fetch ticket count
    const resourceImpact = useResourceMetrics({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled && !!state.article,
        dateRange,
    })

    // Fetch related tickets with drilldown data
    const relatedTickets = useRelatedTicketsWithDrilldown({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        timezone: timezone ?? 'UTC',
        enabled: isPerformanceStatsEnabled && !!state.article,
        ticketCount: resourceImpact.data?.tickets?.value ?? 0,
        dateRange,
    })

    return isPerformanceStatsEnabled ? relatedTickets : undefined
}
