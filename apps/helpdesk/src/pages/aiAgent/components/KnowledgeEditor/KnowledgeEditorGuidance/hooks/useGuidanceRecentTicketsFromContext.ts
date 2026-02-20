import { useMemo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { formatDateRangeSubtitle } from '../../shared/useVersionHistoryBase/useVersionHistoryBase'
import { useGuidanceStore } from '../context'

export type GuidanceRecentTicketsData = KnowledgeRecentTicketsData

export const useGuidanceRecentTicketsFromContext = ():
    | GuidanceRecentTicketsData
    | undefined => {
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

    const recentTickets = useKnowledgeRecentTickets({
        resourceSourceId: guidanceArticleId ?? 0,
        resourceSourceSetId: guidanceHelpCenterId,
        shopIntegrationId,
        enabled: !!guidanceArticleId,
        dateRange: impactDateRange,
    })

    return useMemo(
        () => ({
            ...recentTickets,
            subtitle: formatDateRangeSubtitle(impactDateRange),
        }),
        [recentTickets, impactDateRange],
    )
}
