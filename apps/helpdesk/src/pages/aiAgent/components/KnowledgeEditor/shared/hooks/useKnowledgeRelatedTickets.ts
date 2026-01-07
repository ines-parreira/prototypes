import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    getLast28DaysDateRange,
    useRelatedTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/resourceMetrics'
import useAppSelector from 'hooks/useAppSelector'
import type { Props as RelatedTicketsProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionRelatedTickets'
import { getTimezone } from 'state/currentUser/selectors'

export type KnowledgeRelatedTicketsData = Omit<RelatedTicketsProps, 'sectionId'>

type Params = {
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    enabled?: boolean
}

/**
 * Base hook for fetching related tickets for any knowledge item (article, guidance, or snippet).
 *
 * @param resourceSourceId - The ID of the knowledge item (article, guidance, or snippet)
 * @param resourceSourceSetId - The ID of the help center
 * @param shopIntegrationId - The ID of the shop
 * @param enabled - Whether to fetch data (default: true)
 * @returns Related tickets data or undefined if feature flag is disabled
 */
export const useKnowledgeRelatedTickets = ({
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    enabled = true,
}: Params): KnowledgeRelatedTicketsData | undefined => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)

    // Calculate date range once to ensure consistency
    const dateRange = useMemo(() => getLast28DaysDateRange(), [])

    const isEnabled = isPerformanceStatsEnabled && enabled

    // Get resource metrics to fetch ticket count
    const resourceImpact = useResourceMetrics({
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        timezone: timezone ?? 'UTC',
        enabled: isEnabled,
        dateRange,
    })

    // Fetch related tickets with drilldown data
    const relatedTickets = useRelatedTicketsWithDrilldown({
        resourceSourceId,
        resourceSourceSetId,
        timezone: timezone ?? 'UTC',
        enabled: isEnabled,
        ticketCount: resourceImpact.data?.tickets?.value ?? 0,
        ticketCountIsLoading: resourceImpact.isLoading,
        dateRange,
    })

    return relatedTickets
}
