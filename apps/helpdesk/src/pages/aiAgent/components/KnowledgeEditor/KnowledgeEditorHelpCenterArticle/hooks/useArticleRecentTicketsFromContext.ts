import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useArticleContext } from '../context'

export type ArticleRecentTicketsData = KnowledgeRecentTicketsData

export const useArticleRecentTicketsFromContext = ():
    | ArticleRecentTicketsData
    | undefined => {
    const { state, config } = useArticleContext()
    const { helpCenter } = config

    return useKnowledgeRecentTickets({
        resourceSourceId: state.article?.id ?? 0,
        resourceSourceSetId: helpCenter.id,
        shopIntegrationId: helpCenter.shop_integration_id ?? 0,
        enabled: !!state.article,
    })
}
