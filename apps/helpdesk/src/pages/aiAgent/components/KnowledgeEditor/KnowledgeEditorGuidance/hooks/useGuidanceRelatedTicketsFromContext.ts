import type { KnowledgeRelatedTicketsData } from '../../shared/hooks/useKnowledgeRelatedTickets'
import { useKnowledgeRelatedTickets } from '../../shared/hooks/useKnowledgeRelatedTickets'
import { useGuidanceContext } from '../context'

export type GuidanceRelatedTicketsData = KnowledgeRelatedTicketsData

export const useGuidanceRelatedTicketsFromContext = ():
    | GuidanceRelatedTicketsData
    | undefined => {
    const { guidanceArticle, config } = useGuidanceContext()
    const { guidanceHelpCenter } = config

    return useKnowledgeRelatedTickets({
        resourceSourceId: guidanceArticle?.id ?? 0,
        resourceSourceSetId: guidanceHelpCenter.id,
        shopIntegrationId: guidanceHelpCenter.shop_integration_id ?? 0,
        enabled: !!guidanceArticle,
    })
}
