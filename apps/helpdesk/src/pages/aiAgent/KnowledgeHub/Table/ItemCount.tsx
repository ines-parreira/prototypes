import type { TableV1Instance } from '@gorgias/axiom'
import { Text } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

import css from './ItemCount.less'

type ItemCountProps = {
    table: TableV1Instance<GroupedKnowledgeItem>
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

        // Show "including snippets" when search is active OR inUseByAI filter is active
        const showIncludingSnippets = isSearchActive || hasInUseByAIFilter

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
