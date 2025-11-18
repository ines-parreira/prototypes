import { useCallback, useState } from 'react'

import { Modal, OverlayHeader } from '@gorgias/axiom'

import {
    OPEN_SYNC_WEBSITE_MODAL,
    REFETCH_KNOWLEDGE_HUB_TABLE,
} from 'pages/aiAgent/KnowledgeHub/constants'
import { DocumentFilters } from 'pages/aiAgent/KnowledgeHub/DocumentFilters/DocumentFilters'
import { EmptyStates } from 'pages/aiAgent/KnowledgeHub/EmptyState/EmptyStates'
import { HelpCenterSelectModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/HelpCenterSelectModal'
import {
    openSyncStoreWebsiteModal,
    SyncStoreWebsiteModal,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/SyncStoreWebsiteModal'
import { useListenToDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { useGetLastWebsiteSync } from 'pages/aiAgent/KnowledgeHub/hooks/useGetLastWebsiteSync'
import { KnowledgeHubHeader } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/KnowledgeHubHeader'
import { SyncStoreDomainBanner } from 'pages/aiAgent/KnowledgeHub/SyncStoreDomainBanner'
import { KnowledgeHubTable } from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'
import { useKnowledgeHub } from 'pages/aiAgent/KnowledgeHub/useKnowledgeHub'

import css from './KnowledgeHubContainer.less'

export const KnowledgeHubContainer = () => {
    const [selectedFolder, setSelectedFolder] =
        useState<GroupedKnowledgeItem | null>(null)
    const [selectedFilter, setSelectedFilter] = useState<KnowledgeType | null>(
        null,
    )
    const [isAddKnowledgeModalOpen, setIsAddKnowledgeModalOpen] =
        useState(false)

    const {
        shopName,
        tableData,
        isInitialLoading,
        hasWebsiteSync,
        faqHelpCenterId,
        syncStatus,
        snippetHelpCenterId,
        refetchKnowledgeHubArticles,
        storeDomainIngestionLog,
    } = useKnowledgeHub()

    const { isSyncLessThan24h, nextSyncDate } = useGetLastWebsiteSync(
        storeDomainIngestionLog,
    )
    const syncTooltipMessage = isSyncLessThan24h
        ? `Your store website was synced less than 24h ago. You can sync again on ${nextSyncDate}.`
        : undefined

    const handleRefetchTable = useCallback(() => {
        void refetchKnowledgeHubArticles()
    }, [refetchKnowledgeHubArticles])

    const handleCloseSyncModals = useCallback(() => {
        setIsAddKnowledgeModalOpen(false)
    }, [])

    useListenToDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE, handleRefetchTable)
    useListenToDocumentEvent(OPEN_SYNC_WEBSITE_MODAL, handleCloseSyncModals)

    const onClick = (data: GroupedKnowledgeItem) => {
        setSelectedFolder(data)
    }

    const handleBack = () => {
        setSelectedFolder(null)
    }

    const onAddKnowledgeClick = () => {
        setIsAddKnowledgeModalOpen(true)
    }

    const onKnowledgeModalOpenChange = (value: boolean) => {
        setIsAddKnowledgeModalOpen(value)
    }

    const onSyncStoreWebsite = () => {
        if (selectedFolder?.type === KnowledgeType.Domain) {
            openSyncStoreWebsiteModal()
        }
    }

    return (
        <div className={css.container}>
            <KnowledgeHubHeader
                shopName={shopName}
                data={selectedFolder}
                onBack={handleBack}
                onAddKnowledge={onAddKnowledgeClick}
                onSync={onSyncStoreWebsite}
                isSyncButtonDisabled={isSyncLessThan24h}
                syncTooltipMessage={syncTooltipMessage}
            />
            <SyncStoreDomainBanner
                syncStatus={syncStatus}
                shopName={shopName}
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
                faqHelpCenterId={faqHelpCenterId}
            />
            <Modal
                isOpen={isAddKnowledgeModalOpen}
                onOpenChange={onKnowledgeModalOpenChange}
            >
                <OverlayHeader title="Add knowledge" />
                <EmptyStates
                    hasWebsiteSync={hasWebsiteSync}
                    titleAlignment="flex-start"
                />
            </Modal>
            <HelpCenterSelectModal />
            <SyncStoreWebsiteModal
                hasWebsiteSync={hasWebsiteSync}
                helpCenterId={snippetHelpCenterId || 0}
            />
        </div>
    )
}
