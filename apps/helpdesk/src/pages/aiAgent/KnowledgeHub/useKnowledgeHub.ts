import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetKnowledgeHubArticles } from 'models/helpCenter/queries'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'
import { transformKnowledgeHubArticlesToKnowledgeItems } from 'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const useKnowledgeHub = () => {
    const accountId = useAppSelector(getCurrentAccountId)
    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )
    const routeShopName = extractShopNameFromUrl(window.location.href)
    const shopName = routeShopName || allShopifyIntegrations[0]?.meta?.shop_name

    const { isLoading: isLoadingStoreConfiguration, storeConfiguration } =
        useAiAgentStoreConfigurationContext()

    const guidanceHelpCenterId = storeConfiguration?.guidanceHelpCenterId
    const snippetHelpCenterId = storeConfiguration?.snippetHelpCenterId
    const faqHelpCenterId = storeConfiguration?.helpCenterId

    const { data, isInitialLoading } = useGetKnowledgeHubArticles(
        {
            account_id: accountId,
            guidance_help_center_id: guidanceHelpCenterId,
            snippet_help_center_id: snippetHelpCenterId,
            faq_help_center_id: faqHelpCenterId,
        },
        {
            enabled: !isLoadingStoreConfiguration,
        },
    )

    const tableData = useMemo(
        () =>
            data?.articles
                ? transformKnowledgeHubArticlesToKnowledgeItems(data.articles)
                : [],
        [data],
    )

    const hasWebsiteSync = !!tableData.find(
        (item) => item.type === KnowledgeType.Domain,
    )

    return {
        shopName,
        tableData,
        isInitialLoading,
        hasWebsiteSync,
        faqHelpCenterId,
    }
}
