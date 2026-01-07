import type { KnowledgeRelatedTicketsData } from '../../shared/hooks/useKnowledgeRelatedTickets'
import { useKnowledgeRelatedTickets } from '../../shared/hooks/useKnowledgeRelatedTickets'

export type SnippetRelatedTicketsData = KnowledgeRelatedTicketsData

type Params = {
    snippetId: number
    helpCenterId: number
    shopIntegrationId: number
    enabled?: boolean
}

/**
 * Hook for fetching related tickets for snippets.
 */
export const useSnippetRelatedTickets = ({
    snippetId,
    helpCenterId,
    shopIntegrationId,
    enabled = true,
}: Params): SnippetRelatedTicketsData | undefined => {
    return useKnowledgeRelatedTickets({
        resourceSourceId: snippetId,
        resourceSourceSetId: helpCenterId,
        shopIntegrationId,
        enabled,
    })
}
