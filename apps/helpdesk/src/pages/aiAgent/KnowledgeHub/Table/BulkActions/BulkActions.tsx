import { useCallback, useState } from 'react'

import type { Table } from '@gorgias/axiom'

import { DuplicateGuidance } from '../../../components/KnowledgeEditor/shared/DuplicateGuidance/DuplicateGuidance'
import { useGuidanceArticleMutation } from '../../../hooks/useGuidanceArticleMutation'
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
        useBulkKnowledgeActions({ helpCenterIds })

    const { duplicate, isGuidanceArticleUpdating } = useGuidanceArticleMutation(
        {
            guidanceHelpCenterId: helpCenterIds.guidanceHelpCenterId ?? 0,
        },
    )

    const handleBulkDuplicate = useCallback(
        async (articleIds: number[], shopNames: string[]) => {
            if (
                !helpCenterIds.guidanceHelpCenterId ||
                articleIds.length === 0 ||
                shopNames.length === 0
            ) {
                return { success: false }
            }

            try {
                await duplicate(articleIds, shopNames)
                return { success: true, shopNames }
            } catch {
                return { success: false }
            }
        },
        [duplicate, helpCenterIds.guidanceHelpCenterId],
    )

    const isAllContentView = activeContentType === null

    const hasSelection = selectedItems.length > 0

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

    const faqEnableValidationConfig = getAIAgentButtonConfig(selectedItems)
    const faqDisableValidationConfig = getAIAgentButtonConfig(selectedItems)

    const guidanceLimitConfig = getBulkEnableButtonConfig(guidanceRows)
    const enableForAIButtonConfig =
        faqEnableValidationConfig.mode === ButtonRenderMode.DisabledWithTooltip
            ? faqEnableValidationConfig
            : guidanceLimitConfig

    const disableForAIButtonConfig = faqDisableValidationConfig

    const duplicateButtonConfig = getDuplicateButtonMode(
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
        isLoading ||
        isGuidanceArticleUpdating ||
        duplicateButtonConfig.mode === ButtonRenderMode.DisabledWithTooltip
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

    const showClearSearch = isSearchActive && onClearSearch

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

                    <DuplicateGuidance
                        isDisabled={isDuplicateActionDisabled}
                        renderMode={duplicateButtonConfig.mode}
                        tooltipMessage={duplicateButtonConfig.tooltipMessage}
                        shopName={shopName}
                        articleIds={selectedItems.map((item) =>
                            Number(item.id),
                        )}
                        onDuplicate={handleBulkDuplicate}
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
