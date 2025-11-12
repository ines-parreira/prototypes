import { useState } from 'react'

import { Modal, OverlayHeader } from '@gorgias/axiom'

import { DocumentFilters } from './DocumentFilters/DocumentFilters'
import { EmptyStates } from './EmptyState/EmptyStates'
import { KnowledgeHubHeader } from './KnowledgeHubHeader/KnowledgeHubHeader'
import { KnowledgeHubTable } from './Table/KnowledgeHubTable'
import { GroupedKnowledgeItem, KnowledgeType } from './types'
import { useKnowledgeHub } from './useKnowledgeHub'

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
        </div>
    )
}
