import { useState } from 'react'

import type { Table } from '@gorgias/axiom'

import { useBulkKnowledgeActions } from '../../hooks/useBulkKnowledgeActions'
import type { GroupedKnowledgeItem, KnowledgeType } from '../../types'
import { ClearSearchButton } from './ClearSearchButton'
import { DeleteButton } from './DeleteButton'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { DisableForAIButton } from './DisableForAIButton'
import { DuplicateSelect } from './DuplicateSelect'
import { EnableForAIButton } from './EnableForAIButton'
import { ButtonRenderMode } from './types'
import {
    getAIAgentButtonConfig,
    getDeleteButtonMode,
    getDuplicateButtonMode,
    TOOLTIP_MESSAGES,
} from './utils'

import css from './BulkActions.less'

type BulkActionsProps = {
    table: Table<GroupedKnowledgeItem>
    helpCenterIds: {
        guidanceHelpCenterId?: number | null
        faqHelpCenterId?: number | null
        snippetHelpCenterId?: number | null
    }
    isSearchActive?: boolean
    onClearSearch?: () => void
    activeContentType?: KnowledgeType | null
}

export const BulkActions = ({
    table,
    helpCenterIds,
    isSearchActive = false,
    onClearSearch,
    activeContentType = null,
}: BulkActionsProps) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const selectedRows = table.getFilteredSelectedRowModel().rows || []
    const selectedItems = selectedRows.map((row) => row.original)

    const { handleBulkEnable, handleBulkDisable, handleBulkDelete, isLoading } =
        useBulkKnowledgeActions(helpCenterIds)

    const isAllContentView = activeContentType === null

    const aiAgentButtonConfig = getAIAgentButtonConfig(selectedItems)
    const duplicateMode = getDuplicateButtonMode(
        selectedItems,
        isAllContentView,
    )
    const deleteMode = getDeleteButtonMode(selectedItems, isAllContentView)

    const isAIAgentActionDisabled =
        isLoading ||
        aiAgentButtonConfig.mode === ButtonRenderMode.DisabledWithTooltip
    const isDuplicateActionDisabled =
        isLoading || duplicateMode === ButtonRenderMode.DisabledWithTooltip
    const isDeleteActionDisabled =
        isLoading || deleteMode === ButtonRenderMode.DisabledWithTooltip

    const hasSelection = selectedItems.length > 0
    const hasFilteredRows = table.getRowModel().rows.length > 0

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = () => {
        handleBulkDelete(selectedItems)
        setIsDeleteModalOpen(false)
    }

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false)
    }

    const showClearSearch = isSearchActive && hasFilteredRows && onClearSearch

    if (!showClearSearch && !hasSelection) {
        return null
    }

    return (
        <div className={css.bulkActions} data-name={'bulk-actions'}>
            {hasSelection && (
                <>
                    <EnableForAIButton
                        onClick={() => handleBulkEnable(selectedItems)}
                        isDisabled={isAIAgentActionDisabled}
                        renderMode={aiAgentButtonConfig.mode}
                        tooltipMessage={aiAgentButtonConfig.tooltipMessage}
                    />

                    <DisableForAIButton
                        onClick={() => handleBulkDisable(selectedItems)}
                        isDisabled={isAIAgentActionDisabled}
                        renderMode={aiAgentButtonConfig.mode}
                        tooltipMessage={aiAgentButtonConfig.tooltipMessage}
                    />

                    <DuplicateSelect
                        isDisabled={isDuplicateActionDisabled}
                        renderMode={duplicateMode}
                        tooltipMessage={TOOLTIP_MESSAGES.duplicate}
                    />

                    <DeleteButton
                        onClick={handleDeleteClick}
                        isDisabled={isDeleteActionDisabled}
                        renderMode={deleteMode}
                        tooltipMessage={TOOLTIP_MESSAGES.delete}
                    />

                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        selectedItems={selectedItems}
                        onConfirm={handleDeleteConfirm}
                        onCancel={handleDeleteCancel}
                    />
                </>
            )}
            {showClearSearch && <ClearSearchButton onClick={onClearSearch} />}
        </div>
    )
}
