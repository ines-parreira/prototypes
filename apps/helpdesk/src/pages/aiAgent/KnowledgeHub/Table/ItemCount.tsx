import type { Table } from '@gorgias/axiom'
import { Text } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './ItemCount.less'

type ItemCountProps = {
    table: Table<GroupedKnowledgeItem>
    isSearchActive: boolean
    hasActiveFilters?: boolean
    hasInUseByAIFilter?: boolean
}

export const ItemCount = ({
    table,
    isSearchActive,
    hasActiveFilters = false,
    hasInUseByAIFilter = false,
}: ItemCountProps) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length
    const totalRows = table.getFilteredRowModel().rows.length

    if (selectedCount > 0) {
        return (
            <Text variant="medium" size="sm" className={css.itemCount}>
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </Text>
        )
    }

    if (isSearchActive || hasActiveFilters) {
        if (totalRows === 0) {
            return (
                <Text variant="medium" size="sm" className={css.itemCount}>
                    0 results found
                </Text>
            )
        }

        // Show "including snippets" when:
        // 1. InUseByAI filter is active (takes priority), OR
        // 2. Search is active without any other filters
        const showIncludingSnippets =
            hasInUseByAIFilter || (isSearchActive && !hasActiveFilters)

        if (showIncludingSnippets) {
            return (
                <Text variant="medium" size="sm" className={css.itemCount}>
                    {totalRows} result{totalRows !== 1 ? 's' : ''} found
                    including snippets
                </Text>
            )
        }

        return (
            <Text variant="medium" size="sm" className={css.itemCount}>
                {totalRows} result{totalRows !== 1 ? 's' : ''} found
            </Text>
        )
    }

    return (
        <Text variant="medium" size="sm" className={css.itemCount}>
            {totalRows} item{totalRows !== 1 ? 's' : ''}
        </Text>
    )
}
