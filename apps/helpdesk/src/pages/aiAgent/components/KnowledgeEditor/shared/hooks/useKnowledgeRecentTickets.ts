import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    getLast28DaysDateRange,
    useRecentTicketsWithDrilldown,
    useResourceMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import type { Props as RecentTicketsProps } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSectionRecentTickets'
import { getTimezone } from 'state/currentUser/selectors'

export type KnowledgeRecentTicketsData = Omit<RecentTicketsProps, 'sectionId'>

export type DateRange = {
    start_datetime: string
    end_datetime: string
}

type Params = {
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    enabled?: boolean
    dateRange?: DateRange
}

/**
 * Base hook for fetching recent tickets for any knowledge item (article, guidance, or snippet).
 *
 * @param resourceSourceId - The ID of the knowledge item (article, guidance, or snippet)
 * @param resourceSourceSetId - The ID of the help center
 * @param shopIntegrationId - The ID of the shop
 * @param enabled - Whether to fetch data (default: true)
 * @param dateRange - Optional custom date range (defaults to last 28 days)
 * @returns Recent tickets data or undefined if feature flag is disabled
 */
export const useKnowledgeRecentTickets = ({
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    enabled = true,
    dateRange: customDateRange,
}: Params): KnowledgeRecentTicketsData | undefined => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const timezone = useAppSelector(getTimezone)

    // Use custom date range if provided, otherwise calculate last 28 days
    const dateRange = useMemo(
        () => customDateRange ?? getLast28DaysDateRange(),
        [customDateRange],
    )

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

    // Fetch recent tickets with drilldown data
    const recentTickets = useRecentTicketsWithDrilldown({
        resourceSourceId,
        resourceSourceSetId,
        shopIntegrationId,
        timezone: timezone ?? 'UTC',
        enabled: isEnabled,
        ticketCount: resourceImpact.data?.tickets?.value ?? 0,
        ticketCountIsLoading: resourceImpact.isLoading,
        dateRange,
    })

    return recentTickets
}
