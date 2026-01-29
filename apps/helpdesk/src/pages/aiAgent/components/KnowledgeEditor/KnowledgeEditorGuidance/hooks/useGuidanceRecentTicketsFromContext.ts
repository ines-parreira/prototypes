import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { formatDateRangeSubtitle } from '../../shared/useVersionHistoryBase/useVersionHistoryBase'
import { useGuidanceContext } from '../context'

export type GuidanceRecentTicketsData = KnowledgeRecentTicketsData

export const useGuidanceRecentTicketsFromContext = ():
    | GuidanceRecentTicketsData
    | undefined => {
    const { guidanceArticle, config, state } = useGuidanceContext()
    const { guidanceHelpCenter } = config

    const recentTickets = useKnowledgeRecentTickets({
        resourceSourceId: guidanceArticle?.id ?? 0,
        resourceSourceSetId: guidanceHelpCenter.id,
        shopIntegrationId: guidanceHelpCenter.shop_integration_id ?? 0,
        enabled: !!guidanceArticle,
        dateRange: state.historicalVersion?.impactDateRange,
    })

    return {
        ...recentTickets,
        subtitle: formatDateRangeSubtitle(
            state.historicalVersion?.impactDateRange,
        ),
    }
}
