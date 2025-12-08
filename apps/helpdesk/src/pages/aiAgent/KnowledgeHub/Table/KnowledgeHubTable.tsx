import { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'

import {
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import {
    EmptyStateNoSearchResults,
    EmptyStateWrapper,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/EmptyStates'
import type { FilterOption } from 'pages/aiAgent/KnowledgeHub/Table/AddFilterButton'
import { AddFilterButton } from 'pages/aiAgent/KnowledgeHub/Table/AddFilterButton'
import { getColumns } from 'pages/aiAgent/KnowledgeHub/Table/columns'
import { ItemCount } from 'pages/aiAgent/KnowledgeHub/Table/ItemCount'
import { SearchInput } from 'pages/aiAgent/KnowledgeHub/Table/SearchInput'
import {
    filterKnowledgeItemsBySearchTerm,
    filterKnowledgeItemsBySource,
    groupKnowledgeItemsBySource,
} from 'pages/aiAgent/KnowledgeHub/Table/utils'
import type {
    GroupedKnowledgeItem,
    KnowledgeItem,
    KnowledgeType,
} from 'pages/aiAgent/KnowledgeHub/types'

import { KnowledgeType as KnowledgeTypeEnum } from '../types'

import css from './KnowledgeHubTable.less'

const FILTER_OPTIONS: FilterOption[] = [
    { label: 'Last Updated Date', value: 'lastUpdatedAt' },
    { label: 'In Use by AI Agent', value: 'inUseByAI' },
]

type KnowledgeHubTableProps = {
    data: KnowledgeItem[]
    isLoading?: boolean
    onRowClick: (data: GroupedKnowledgeItem) => void
    onGuidanceRowClick?: (articleId: number) => void
    onFaqRowClick?: (articleId: number) => void
    onSnippetRowClick?: (articleId: number, type: KnowledgeType) => void
    onFaqEditorOpen?: () => void
    selectedFolder: GroupedKnowledgeItem | null
    selectedTypeFilter?: KnowledgeType | null
    faqHelpCenterId?: number | null
    shopName?: string
    shopType: string
    guidanceHelpCenterId?: number | null
}

export const KnowledgeHubTable = ({
    data,
    isLoading = false,
    onRowClick,
    onGuidanceRowClick,
    onFaqRowClick,
    onSnippetRowClick,
    onFaqEditorOpen,
    selectedFolder,
    selectedTypeFilter = null,
    faqHelpCenterId,
    shopName = '',
    shopType,
    guidanceHelpCenterId,
}: KnowledgeHubTableProps) => {
    const [searchTerm, setSearchTerm] = useState('')

    const { guidanceActions: availableActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

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

    const handleRowClick = useCallback(
        (row: GroupedKnowledgeItem) => {
            if (
                row.type === KnowledgeTypeEnum.Guidance &&
                !row.isGrouped &&
                onGuidanceRowClick
            ) {
                onGuidanceRowClick(Number(row.id))
                return
            }

            if (
                row.type === KnowledgeTypeEnum.FAQ &&
                !row.isGrouped &&
                onFaqRowClick
            ) {
                onFaqRowClick(Number(row.id))
                return
            }

            if (
                (row.type === KnowledgeTypeEnum.Document ||
                    row.type === KnowledgeTypeEnum.URL ||
                    row.type === KnowledgeTypeEnum.Domain) &&
                !row.isGrouped &&
                onSnippetRowClick
            ) {
                onSnippetRowClick(Number(row.id), row.type)
                return
            }

            onRowClick?.(row)
        },
        [onRowClick, onGuidanceRowClick, onFaqRowClick, onSnippetRowClick],
    )

    const columnsWithHighlight = useMemo(() => {
        return getColumns(
            searchTerm,
            handleRowClick,
            availableActions,
            guidanceHelpCenterId,
        )
    }, [searchTerm, handleRowClick, availableActions, guidanceHelpCenterId])

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

    if (!searchTerm && displayData.length === 0 && !isLoading) {
        return (
            <div className={css.emptyTable}>
                <EmptyStateWrapper
                    documentFilter={selectedTypeFilter}
                    articles={displayData}
                    helpCenterId={faqHelpCenterId}
                    onFaqEditorOpen={onFaqEditorOpen}
                />
            </div>
        )
    }

    const isSearchEmptyPage =
        !isLoading && searchTerm && displayData.length === 0

    const clearSearch = () => {
        setSearchTerm('')
    }

    return (
        <div
            className={classNames(css.tableContainer, {
                [css.searchEmptyTable]: isSearchEmptyPage,
            })}
        >
            <div className={css.tableToolbars}>
                <TableToolbar<GroupedKnowledgeItem>
                    table={table}
                    bottomRow={{
                        left: [
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
                        ],
                    }}
                />
                <TableToolbar<GroupedKnowledgeItem>
                    table={table}
                    bottomRow={{
                        left: [
                            {
                                key: 'itemSelected',
                                content: (
                                    <ItemCount
                                        table={table}
                                        isSearchActive={isSearchActive}
                                    />
                                ),
                            },
                        ],
                    }}
                />
            </div>
            <TableRoot withBorder={false}>
                {!isSearchEmptyPage && (
                    <TableHeader>
                        <HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>
                )}

                <TableBodyContent
                    isLoading={isLoading}
                    rows={table.getRowModel().rows}
                    columnCount={table.getAllColumns().length}
                    table={table}
                    renderEmptyStateComponent={() => {
                        return (
                            <EmptyStateNoSearchResults
                                clearSearch={clearSearch}
                            />
                        )
                    }}
                />
            </TableRoot>
            <div className={css.pagination}>
                {!isSearchEmptyPage && (
                    <TableToolbar<GroupedKnowledgeItem>
                        table={table}
                        bottomRow={{ right: ['pagination'] }}
                    />
                )}
            </div>
        </div>
    )
}
