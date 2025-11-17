import { useState } from 'react'

import { Modal, OverlayHeader } from '@gorgias/axiom'

import { DocumentFilters } from 'pages/aiAgent/KnowledgeHub/DocumentFilters/DocumentFilters'
import { EmptyStates } from 'pages/aiAgent/KnowledgeHub/EmptyState/EmptyStates'
import { HelpCenterSelectModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/HelpCenterSelectModal'
import { KnowledgeHubHeader } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/KnowledgeHubHeader'
import { KnowledgeHubTable } from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable'
import type {
    GroupedKnowledgeItem,
    KnowledgeType,
} from 'pages/aiAgent/KnowledgeHub/types'
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
    } = useKnowledgeHub()

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

    return (
        <div className={css.container}>
            <KnowledgeHubHeader
                shopName={shopName}
                data={selectedFolder}
                onBack={handleBack}
                onAddKnowledge={onAddKnowledgeClick}
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
        </div>
    )
}
