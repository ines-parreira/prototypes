import type { KnowledgeRelatedTicketsData } from '../../shared/hooks/useKnowledgeRelatedTickets'
import { useKnowledgeRelatedTickets } from '../../shared/hooks/useKnowledgeRelatedTickets'
import { useArticleContext } from '../context'

export type ArticleRelatedTicketsData = KnowledgeRelatedTicketsData

export const useArticleRelatedTicketsFromContext = ():
    | ArticleRelatedTicketsData
    | undefined => {
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    return useKnowledgeRelatedTickets({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        shopIntegrationId: helpCenter.shop_integration_id ?? 0,
        enabled: !!state.article,
    })
}
