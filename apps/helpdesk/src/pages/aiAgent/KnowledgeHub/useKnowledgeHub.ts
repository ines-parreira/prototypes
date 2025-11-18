import { useDomainSyncStatus } from 'pages/aiAgent/KnowledgeHub/hooks/useDomainSyncStatus'
import { useKnowledgeHubArticles } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubArticles'
import { useShopContext } from 'pages/aiAgent/KnowledgeHub/hooks/useShopContext'

/**
 * Main hook for Knowledge Hub that orchestrates shop context, articles, and sync status
 * Composed of smaller focused hooks for better maintainability
 */
export const useKnowledgeHub = () => {
    const { shopName, storeUrl } = useShopContext()

    const {
        tableData,
        isInitialLoading,
        hasWebsiteSync,
        faqHelpCenterId,
        snippetHelpCenterId,
        refetchKnowledgeHubArticles,
    } = useKnowledgeHubArticles()

    const { syncStatus, storeDomainIngestionLog } = useDomainSyncStatus({
        helpCenterId: snippetHelpCenterId || 0,
        storeUrl,
    })

    return {
        shopName,
        tableData,
        isInitialLoading,
        hasWebsiteSync,
        faqHelpCenterId,
        syncStatus,
        snippetHelpCenterId,
        refetchKnowledgeHubArticles,
        storeDomainIngestionLog,
    }
}
