import type { KnowledgeRecentTicketsData } from '../../shared/hooks/useKnowledgeRecentTickets'
import { useKnowledgeRecentTickets } from '../../shared/hooks/useKnowledgeRecentTickets'

export type SnippetRecentTicketsData = KnowledgeRecentTicketsData

type Params = {
    snippetId: number
    helpCenterId: number
    shopIntegrationId: number
    enabled?: boolean
}

/**
 * Hook for fetching recent tickets for snippets.
 */
export const useSnippetRecentTickets = ({
    snippetId,
    helpCenterId,
    shopIntegrationId,
    enabled = true,
}: Params): SnippetRecentTicketsData | undefined => {
    return useKnowledgeRecentTickets({
        resourceSourceId: snippetId,
        resourceSourceSetId: helpCenterId,
        shopIntegrationId,
        enabled,
    })
}
