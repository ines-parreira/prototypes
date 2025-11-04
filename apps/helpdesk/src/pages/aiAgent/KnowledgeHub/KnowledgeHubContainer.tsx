import { useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { DocumentFilters } from './DocumentFilters/DocumentFilters'
import { KnowledgeHubHeader } from './KnowledgeHubHeader/KnowledgeHubHeader'
import { KnowledgeHubTable } from './Table/KnowledgeHubTable'
import {
    GroupedKnowledgeItem,
    KnowledgeItem,
    KnowledgeType,
    KnowledgeVisibility,
} from './types'

import css from './KnowledgeHubContainer.less'

const mockedTableData: KnowledgeItem[] = [
    {
        type: KnowledgeType.Document,
        title: 'Getting Started with Axiom',
        lastUpdatedAt: '2024-01-15',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'getting_started_axiom.pdf',
        id: '1',
    },
    {
        type: KnowledgeType.Document,
        title: 'Advanced Configuration Guide',
        lastUpdatedAt: '2024-01-20',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'getting_started_axiom.pdf',
        id: '2',
    },
    {
        type: KnowledgeType.Document,
        title: 'API Reference Documentation',
        lastUpdatedAt: '2024-01-25',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'api_docs.pdf',
        id: '3',
    },
    {
        type: KnowledgeType.Document,
        title: 'Security Best Practices',
        lastUpdatedAt: '2024-02-01',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'api_docs.pdf',
        id: '4',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'How to reset your password',
        lastUpdatedAt: '2024-02-10',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '5',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'How to update billing information',
        lastUpdatedAt: '2024-02-12',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '6',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'How to invite team members',
        lastUpdatedAt: '2024-02-15',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '7',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'How to export data',
        lastUpdatedAt: '2024-02-18',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        id: '8',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Integrating Axiom with Third-Party Apps',
        lastUpdatedAt: '2024-03-05',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '9',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Setting Up Webhooks',
        lastUpdatedAt: '2024-03-08',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '10',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Custom Dashboard Configuration',
        lastUpdatedAt: '2024-03-12',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        id: '11',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Data Migration Tutorial',
        lastUpdatedAt: '2024-03-15',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '12',
    },
    {
        type: KnowledgeType.URL,
        title: 'Axiom Knowledge Base - Getting Started',
        lastUpdatedAt: '2024-04-15',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'https://axiomknowledgebase.com',
        id: '13',
    },
    {
        type: KnowledgeType.URL,
        title: 'Axiom Knowledge Base - Advanced Topics',
        lastUpdatedAt: '2024-04-18',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'https://axiomknowledgebase.com',
        id: '14',
    },
    {
        type: KnowledgeType.URL,
        title: 'Axiom Knowledge Base - Troubleshooting',
        lastUpdatedAt: '2024-04-20',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'https://axiomknowledgebase.com',
        id: '15',
    },
    {
        type: KnowledgeType.URL,
        title: 'Community Forum - Best Practices',
        lastUpdatedAt: '2024-04-22',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'https://community.axiom.com',
        id: '16',
    },
    {
        type: KnowledgeType.URL,
        title: 'Community Forum - Code Examples',
        lastUpdatedAt: '2024-04-25',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'https://community1.axiom.com',
        id: '17',
    },
    {
        type: KnowledgeType.Domain,
        title: 'Axiom Official domain',
        lastUpdatedAt: '2024-05-12',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'axiom.com',
        id: '18',
    },
    {
        type: KnowledgeType.Domain,
        title: 'Axiom Support Portal',
        lastUpdatedAt: '2024-05-15',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'axiom.com',
        id: '19',
    },
    {
        type: KnowledgeType.Document,
        title: 'Release Notes v2.0',
        lastUpdatedAt: '2024-05-18',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'axiom.pdf',
        id: '20',
    },
    {
        type: KnowledgeType.Document,
        title: 'Performance Optimization Guide',
        lastUpdatedAt: '2024-05-20',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'axiom1.pdf',
        id: '21',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'How to configure notifications',
        lastUpdatedAt: '2024-05-22',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '22',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Mobile App Setup Guide',
        lastUpdatedAt: '2024-05-25',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        id: '23',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Analytics Dashboard Overview',
        lastUpdatedAt: '2024-05-28',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '24',
    },
    {
        type: KnowledgeType.URL,
        title: 'Developer Portal - API Endpoints',
        lastUpdatedAt: '2024-06-01',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'https://developers.axiom.com',
        id: '25',
    },
    {
        type: KnowledgeType.URL,
        title: 'Developer Portal - Authentication',
        lastUpdatedAt: '2024-06-05',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'https://developers.axiom.com',
        id: '26',
    },
]

export const KnowledgeHubContainer = () => {
    const [selectedFolder, setSelectedFolder] =
        useState<GroupedKnowledgeItem | null>(null)
    const [selectedFilter, setSelectedFilter] = useState<KnowledgeType | null>(
        null,
    )
    const allShopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )
    const routeShopName = extractShopNameFromUrl(window.location.href)
    const shopName = routeShopName || allShopifyIntegrations[0]?.meta?.shop_name

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
                data={mockedTableData}
                onRowClick={onClick}
                selectedFolder={selectedFolder}
                selectedTypeFilter={selectedFilter}
            />
        </div>
    )
}
