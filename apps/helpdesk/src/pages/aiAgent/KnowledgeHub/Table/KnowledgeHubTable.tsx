import { useMemo, useState } from 'react'

import {
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import { EmptyStateWrapper } from '../EmptyState/EmptyStates'
import type {
    GroupedKnowledgeItem,
    KnowledgeItem,
    KnowledgeType,
} from '../types'
import type { FilterOption } from './AddFilterButton'
import { AddFilterButton } from './AddFilterButton'
import { getColumns } from './columns'
import { ItemCount } from './ItemCount'
import { SearchInput } from './SearchInput'
import {
    filterKnowledgeItemsBySearchTerm,
    filterKnowledgeItemsBySource,
    groupKnowledgeItemsBySource,
} from './utils'

import css from './KnowledgeHubTable.less'

const FILTER_OPTIONS: FilterOption[] = [
    { label: 'Last Updated Date', value: 'lastUpdatedAt' },
    { label: 'In Use by AI Agent', value: 'inUseByAI' },
]

type KnowledgeHubTableProps = {
    data: KnowledgeItem[]
    isLoading?: boolean
    onRowClick: (data: GroupedKnowledgeItem) => void
    selectedFolder: GroupedKnowledgeItem | null
    selectedTypeFilter?: KnowledgeType | null
    faqHelpCenterId?: number | null
}

export const KnowledgeHubTable = ({
    data,
    isLoading = false,
    onRowClick,
    selectedFolder,
    selectedTypeFilter = null,
    faqHelpCenterId,
}: KnowledgeHubTableProps) => {
    const [searchTerm, setSearchTerm] = useState('')

    const isSearchActive = Boolean(searchTerm)

    const filteredData = useMemo(() => {
        let filtered = data

        if (selectedTypeFilter) {
            filtered = filtered.filter(
                (item) => item.type === selectedTypeFilter,
            )
        }

        if (!searchTerm) {
            return filtered
        }

        return filtered.filter((item) => {
            const searchLower = searchTerm.toLowerCase()
            return (
                item.title.toLowerCase().includes(searchLower) ||
                item.source?.toLowerCase().includes(searchLower)
            )
        })
    }, [data, searchTerm, selectedTypeFilter])

    const displayData = useMemo(() => {
        const shouldGroupData = isSearchActive || Boolean(selectedFolder)
        const groupedData = groupKnowledgeItemsBySource(
            filteredData,
            !shouldGroupData,
        )

        const filteredGroupedDataBySource = filterKnowledgeItemsBySource(
            groupedData,
            selectedFolder?.source,
        )

        const filteredBySearchTerm = filterKnowledgeItemsBySearchTerm(
            filteredGroupedDataBySource,
            searchTerm,
        )

        return filteredBySearchTerm
    }, [filteredData, isSearchActive, selectedFolder, searchTerm])

    const columnsWithHighlight = useMemo(() => {
        return getColumns(searchTerm, onRowClick)
    }, [searchTerm, onRowClick])
    const table = useTable<GroupedKnowledgeItem>({
        data: displayData,
        columns: columnsWithHighlight,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
        },
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 10,
            initialPageIndex: 0,
        },
        selectionConfig: {
            enableRowSelection: (row: { original: GroupedKnowledgeItem }) => {
                return !row.original.isGrouped
            },
            enableMultiRowSelection: true,
        },
    })

    if (displayData.length === 0 && !isLoading) {
        return (
            <div className={css.emptyTable}>
                <EmptyStateWrapper
                    documentFilter={selectedTypeFilter}
                    articles={displayData}
                    helpCenterId={faqHelpCenterId}
                />
            </div>
        )
    }

    return (
        <div className={css.tableContainer}>
            <div className={css.tableToolbars}>
                <TableToolbar<GroupedKnowledgeItem>
                    table={table}
                    left={[
                        {
                            key: 'mySearch',
                            content: (
                                <SearchInput
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search..."
                                />
                            ),
                        },
                        {
                            key: 'addFilter',
                            content: (
                                <AddFilterButton options={FILTER_OPTIONS} />
                            ),
                        },
                    ]}
                />
                <TableToolbar<GroupedKnowledgeItem>
                    table={table}
                    left={[
                        {
                            key: 'itemSelected',
                            content: (
                                <ItemCount
                                    table={table}
                                    isSearchActive={isSearchActive}
                                />
                            ),
                        },
                    ]}
                />
            </div>
            <TableRoot withBorder={false}>
                <TableHeader>
                    <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
                </TableHeader>
                <TableBodyContent
                    isLoading={isLoading}
                    rows={table.getRowModel().rows}
                    columnCount={table.getAllColumns().length}
                    table={table}
                />
            </TableRoot>
            <div className={css.pagination}>
                <TableToolbar<GroupedKnowledgeItem>
                    table={table}
                    right={['pagination']}
                />
            </div>
        </div>
    )
}
