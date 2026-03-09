import { useDomainSyncStatus } from 'pages/aiAgent/KnowledgeHub/hooks/useDomainSyncStatus'
import { useFileIngestionStatus } from 'pages/aiAgent/KnowledgeHub/hooks/useFileIngestionStatus'
import { useKnowledgeHubArticles } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubArticles'
import { useShopContext } from 'pages/aiAgent/KnowledgeHub/hooks/useShopContext'
import { useUrlSyncStatus } from 'pages/aiAgent/KnowledgeHub/hooks/useUrlSyncStatus'
import useHelpCenterCustomDomainHostnames from 'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames'

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
        guidanceHelpCenterId,
        refetchKnowledgeHubArticles,
    } = useKnowledgeHubArticles()

    const { syncStatus, storeDomainIngestionLog } = useDomainSyncStatus({
        helpCenterId: snippetHelpCenterId || 0,
        storeUrl,
    })

    const { customDomainHostnames: helpCenterCustomDomains } =
        useHelpCenterCustomDomainHostnames(snippetHelpCenterId || 0)

    // Get existing URLs from tableData for URL sync validation
    const existingUrls = Array.from(
        new Set(
            tableData
                .filter((item) => item.type === 'url')
                .map((item) => item.source)
                .filter((url): url is string => !!url) || [],
        ),
    )

    const {
        syncStatus: urlSyncStatus,
        syncingUrls,
        urlIngestionLogs,
        totalCount: urlTotalCount,
        completedCount: urlCompletedCount,
        successCount: urlSuccessCount,
        pendingCount: urlPendingCount,
    } = useUrlSyncStatus({
        helpCenterId: snippetHelpCenterId || 0,
        existingUrls,
        helpCenterCustomDomains: helpCenterCustomDomains || [],
        shopName,
    })

    const {
        fileIngestionStatus,
        fileIngestionLogs,
        totalCount: fileTotalCount,
        completedCount: fileCompletedCount,
        successCount: fileSuccessCount,
        pendingCount: filePendingCount,
    } = useFileIngestionStatus({
        helpCenterId: snippetHelpCenterId || 0,
    })

    return {
        shopName,
        tableData,
        isInitialLoading,
        hasWebsiteSync,
        faqHelpCenterId,
        syncStatus,
        snippetHelpCenterId,
        guidanceHelpCenterId,
        refetchKnowledgeHubArticles,
        storeDomainIngestionLog,
        urlSyncStatus,
        syncingUrls,
        urlIngestionLogs,
        existingUrls,
        urlTotalCount,
        urlCompletedCount,
        urlSuccessCount,
        urlPendingCount,
        fileIngestionStatus,
        fileIngestionLogs,
        fileTotalCount,
        fileCompletedCount,
        fileSuccessCount,
        filePendingCount,
    }
}
