import { useMemo, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetKnowledgeHubArticles } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { DocumentFilters } from './DocumentFilters/DocumentFilters'
import { KnowledgeHubHeader } from './KnowledgeHubHeader/KnowledgeHubHeader'
import { KnowledgeHubTable } from './Table/KnowledgeHubTable'
import { GroupedKnowledgeItem, KnowledgeType } from './types'
import { transformKnowledgeHubArticlesToKnowledgeItems } from './utils/transformKnowledgeHubArticles'

import css from './KnowledgeHubContainer.less'

export const KnowledgeHubContainer = () => {
    const [selectedFolder, setSelectedFolder] =
        useState<GroupedKnowledgeItem | null>(null)
    const [selectedFilter, setSelectedFilter] = useState<KnowledgeType | null>(
        null,
    )
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

    const onClick = (data: GroupedKnowledgeItem) => {
        setSelectedFolder(data)
    }

    const handleBack = () => {
        setSelectedFolder(null)
    }

    return (
        <div className={css.container}>
            <KnowledgeHubHeader
                shopName={shopName}
                data={selectedFolder}
                onBack={handleBack}
            />
            <DocumentFilters
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
            />
            <KnowledgeHubTable
                data={tableData}
                isLoading={isInitialLoading}
                onRowClick={onClick}
                selectedFolder={selectedFolder}
                selectedTypeFilter={selectedFilter}
            />
        </div>
    )
}
