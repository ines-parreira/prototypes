import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useGuidanceContext } from '../context'

export type GuidanceRecentTicketsData = KnowledgeRecentTicketsData

export const useGuidanceRecentTicketsFromContext = ():
    | GuidanceRecentTicketsData
    | undefined => {
    const { guidanceArticle, config } = useGuidanceContext()
    const { guidanceHelpCenter } = config

    return useKnowledgeRecentTickets({
        resourceSourceId: guidanceArticle?.id ?? 0,
        resourceSourceSetId: guidanceHelpCenter.id,
        shopIntegrationId: guidanceHelpCenter.shop_integration_id ?? 0,
        enabled: !!guidanceArticle,
    })
}
