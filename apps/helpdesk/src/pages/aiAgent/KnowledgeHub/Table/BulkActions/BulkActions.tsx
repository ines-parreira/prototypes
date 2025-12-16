import { useState } from 'react'

import type { Table } from '@gorgias/axiom'

import { useBulkKnowledgeActions } from '../../hooks/useBulkKnowledgeActions'
import type {
    FilteredKnowledgeHubArticle,
    GroupedKnowledgeItem,
    KnowledgeType,
} from '../../types'
import { mapKnowledgeVisibilityToArticleVisibility } from '../../types'
import { ClearSearchButton } from './ClearSearchButton'
import { DeleteButton } from './DeleteButton'
import { DeleteConfirmationModal } from './DeleteConfirmationModal'
import { DisableForAIButton } from './DisableForAIButton'
import { DuplicateSelect } from './DuplicateSelect'
import { EnableForAIButton } from './EnableForAIButton'
import { ButtonRenderMode } from './types'
import {
    getAIAgentButtonConfig,
    getBulkEnableButtonConfig,
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
    shopName?: string
}

export const BulkActions = ({
    table,
    helpCenterIds,
    isSearchActive = false,
    onClearSearch,
    activeContentType = null,
    shopName,
}: BulkActionsProps) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const selectedRows = table.getFilteredSelectedRowModel().rows || []
    const selectedItems = selectedRows.map((row) => row.original)

    const { handleBulkEnable, handleBulkDisable, handleBulkDelete, isLoading } =
        useBulkKnowledgeActions(helpCenterIds)

    const isAllContentView = activeContentType === null

    const hasSelection = selectedItems.length > 0
    const hasFilteredRows = table.getRowModel().rows.length > 0

    const guidanceRows = table
        .getCoreRowModel()
        .rows.filter((row) => row.original.type === 'guidance')
        .map((row) => {
            return {
                ...row.original,
                visibility: mapKnowledgeVisibilityToArticleVisibility(
                    row.original.inUseByAI,
                ),
            } as unknown as FilteredKnowledgeHubArticle
        })

    const faqValidationConfig = getAIAgentButtonConfig(selectedItems)

    const guidanceLimitConfig = getBulkEnableButtonConfig(guidanceRows)
    const enableForAIButtonConfig =
        faqValidationConfig.mode === ButtonRenderMode.DisabledWithTooltip
            ? faqValidationConfig
            : guidanceLimitConfig

    const disableForAIButtonConfig = faqValidationConfig

    const duplicateMode = getDuplicateButtonMode(
        selectedItems,
        isAllContentView,
    )
    const deleteMode = getDeleteButtonMode(selectedItems, isAllContentView)

    const isDisableButtonDisabled =
        isLoading ||
        disableForAIButtonConfig.mode === ButtonRenderMode.DisabledWithTooltip
    const isEnableForAIButtonDisabled =
        isLoading ||
        enableForAIButtonConfig.mode === ButtonRenderMode.DisabledWithTooltip
    const isDuplicateActionDisabled =
        isLoading || duplicateMode === ButtonRenderMode.DisabledWithTooltip
    const isDeleteActionDisabled =
        isLoading || deleteMode === ButtonRenderMode.DisabledWithTooltip

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
                        isDisabled={isEnableForAIButtonDisabled}
                        renderMode={enableForAIButtonConfig.mode}
                        tooltipMessage={enableForAIButtonConfig.tooltipMessage}
                        guidanceArticles={guidanceRows}
                    />

                    <DisableForAIButton
                        onClick={() => handleBulkDisable(selectedItems)}
                        isDisabled={isDisableButtonDisabled}
                        renderMode={disableForAIButtonConfig.mode}
                        tooltipMessage={disableForAIButtonConfig.tooltipMessage}
                    />

                    <DuplicateSelect
                        isDisabled={isDuplicateActionDisabled}
                        renderMode={duplicateMode}
                        tooltipMessage={TOOLTIP_MESSAGES.duplicate}
                        shopName={shopName}
                        helpCenterId={helpCenterIds.guidanceHelpCenterId}
                        selectedItems={selectedItems}
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
