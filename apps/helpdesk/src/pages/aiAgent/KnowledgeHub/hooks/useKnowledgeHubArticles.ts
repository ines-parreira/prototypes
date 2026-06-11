import { useMemo } from 'react'

import { useAppSelector } from 'hooks/useAppSelector'
import {
    useGetFileIngestion,
    useGetKnowledgeHubArticles,
} from 'models/helpCenter/queries'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'
import { enrichDocumentItemsWithIngestion } from 'pages/aiAgent/KnowledgeHub/utils/enrichDocumentsWithIngestion'
import { transformKnowledgeHubArticlesToKnowledgeItems } from 'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getCurrentAccountId } from 'state/currentAccount/selectors'

/**
 * Hook to fetch and transform knowledge hub articles
 * Handles loading state and transforms articles into knowledge items
 */
export const useKnowledgeHubArticles = () => {
    const accountId = useAppSelector(getCurrentAccountId)
    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useAiAgentStoreConfigurationContext()

    const guidanceHelpCenterId = storeConfiguration?.guidanceHelpCenterId
    const snippetHelpCenterId = storeConfiguration?.snippetHelpCenterId
    const faqHelpCenterId = storeConfiguration?.helpCenterId

    const {
        data,
        isInitialLoading,
        refetch: refetchKnowledgeHubArticles,
    } = useGetKnowledgeHubArticles(
        {
            account_id: accountId,
            guidance_help_center_id: guidanceHelpCenterId,
            snippet_help_center_id: snippetHelpCenterId,
            faq_help_center_id: faqHelpCenterId,
            exclude_articles_with_intent: true,
        },
        {
            enabled: !isLoadingStoreConfiguration,
        },
    )

    const { data: fileIngestionResponse } = useGetFileIngestion(
        {
            help_center_id: snippetHelpCenterId ?? 0,
        },
        {
            enabled: !!snippetHelpCenterId,
            refetchOnWindowFocus: false,
        },
    )

    const tableData = useMemo(() => {
        const items = data?.articles
            ? transformKnowledgeHubArticlesToKnowledgeItems(data.articles)
            : []

        return enrichDocumentItemsWithIngestion(
            items,
            fileIngestionResponse?.data ?? [],
        )
    }, [data, fileIngestionResponse?.data])

    const hasWebsiteSync = !!tableData.find(
        (item) => item.type === KnowledgeType.Domain,
    )

    return {
        tableData,
        isInitialLoading,
        hasWebsiteSync,
        faqHelpCenterId,
        snippetHelpCenterId,
        guidanceHelpCenterId,
        refetchKnowledgeHubArticles,
    }
}
