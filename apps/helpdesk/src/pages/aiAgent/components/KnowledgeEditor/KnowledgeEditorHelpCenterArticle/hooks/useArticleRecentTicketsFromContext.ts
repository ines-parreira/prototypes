import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { formatDateRangeSubtitle } from '../../shared/useVersionHistoryBase/useVersionHistoryBase'
import { useArticleContext } from '../context'

export type ArticleRecentTicketsData = KnowledgeRecentTicketsData

export const useArticleRecentTicketsFromContext = ():
    | ArticleRecentTicketsData
    | undefined => {
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    const recentTickets = useKnowledgeRecentTickets({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        shopIntegrationId: helpCenter.shop_integration_id ?? 0,
        enabled: !!state.article,
        dateRange: state.historicalVersion?.impactDateRange,
    })

    return {
        ...recentTickets,
        subtitle: formatDateRangeSubtitle(
            state.historicalVersion?.impactDateRange,
        ),
    }
}
