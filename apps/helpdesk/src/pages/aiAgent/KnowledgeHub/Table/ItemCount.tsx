import { Table, Text } from '@gorgias/axiom'

import { GroupedKnowledgeItem } from '../types'

import css from './ItemCount.less'

type ItemCountProps = {
    table: Table<GroupedKnowledgeItem>
    isSearchActive: boolean
}

export const ItemCount = ({ table, isSearchActive }: ItemCountProps) => {
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

    if (isSearchActive) {
        return (
            <Text variant="medium" size="sm" className={css.itemCount}>
                {totalRows} result{totalRows !== 1 ? 's' : ''} including
                snippets
            </Text>
        )
    }

    return (
        <Text variant="medium" size="sm" className={css.itemCount}>
            {totalRows} item{totalRows !== 1 ? 's' : ''}
        </Text>
    )
}
