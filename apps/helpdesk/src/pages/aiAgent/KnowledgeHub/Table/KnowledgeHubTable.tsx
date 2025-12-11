import { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'
import moment from 'moment-timezone'

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
import { BulkActions } from 'pages/aiAgent/KnowledgeHub/Table/BulkActions/BulkActions'
import { getColumns } from 'pages/aiAgent/KnowledgeHub/Table/columns'
import { InUseByAIFilter } from 'pages/aiAgent/KnowledgeHub/Table/InUseByAIFilter'
import { ItemCount } from 'pages/aiAgent/KnowledgeHub/Table/ItemCount'
import { LastUpdatedDateFilter } from 'pages/aiAgent/KnowledgeHub/Table/LastUpdatedDateFilter'
import { SearchInput } from 'pages/aiAgent/KnowledgeHub/Table/SearchInput'
import {
    filterKnowledgeItemsByDateRange,
    filterKnowledgeItemsByInUseByAI,
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
    { label: 'Last updated date', value: 'lastUpdatedAt' },
    { label: 'In use by AI Agent', value: 'inUseByAI' },
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
    searchTerm: string
    onSearchChange: (value: string) => void
    dateRange: { startDate: string | null; endDate: string | null }
    onDateRangeChange: (
        startDate: string | null,
        endDate: string | null,
    ) => void
    inUseByAIFilter: boolean | null
    onInUseByAIChange: (value: boolean | null) => void
    faqHelpCenterId?: number | null
    shopName?: string
    shopType: string
    guidanceHelpCenterId?: number | null
    snippetHelpCenterId?: number | null
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
    searchTerm,
    onSearchChange,
    dateRange,
    onDateRangeChange,
    inUseByAIFilter,
    onInUseByAIChange,
    faqHelpCenterId,
    shopName = '',
    shopType,
    guidanceHelpCenterId,
    snippetHelpCenterId,
}: KnowledgeHubTableProps) => {
    // Initialize activeFilterTypes from URL params
    const [activeFilterTypes, setActiveFilterTypes] = useState<Set<string>>(
        () => {
            const active = new Set<string>()
            if (dateRange.startDate || dateRange.endDate) {
                active.add('lastUpdatedAt')
            }
            if (inUseByAIFilter !== null) {
                active.add('inUseByAI')
            }
            return active
        },
    )

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

        if (inUseByAIFilter !== null) {
            filtered = filterKnowledgeItemsByInUseByAI(
                filtered,
                inUseByAIFilter,
            )
        }

        if (dateRange.startDate || dateRange.endDate) {
            const startMoment = dateRange.startDate
                ? moment(dateRange.startDate)
                : null
            const endMoment = dateRange.endDate
                ? moment(dateRange.endDate)
                : null
            filtered = filterKnowledgeItemsByDateRange(
                filtered,
                startMoment,
                endMoment,
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
    }, [
        data,
        searchTerm,
        selectedTypeFilter,
        inUseByAIFilter,
        dateRange.startDate,
        dateRange.endDate,
    ])

    const displayData = useMemo(() => {
        const shouldGroupData =
            isSearchActive ||
            Boolean(selectedFolder) ||
            inUseByAIFilter !== null
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
    }, [
        filteredData,
        isSearchActive,
        selectedFolder,
        searchTerm,
        inUseByAIFilter,
    ])

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
        additionalOptions: {
            getRowId: (row) => row.id,
        },
    })

    const isSearchEmptyPage =
        !isLoading &&
        (searchTerm ||
            dateRange.startDate ||
            dateRange.endDate ||
            inUseByAIFilter !== null) &&
        displayData.length === 0

    if (!isSearchEmptyPage && displayData.length === 0 && !isLoading) {
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

    const clearSearch = () => {
        onSearchChange('')
    }

    const handleFilterSelect = (filterValue: string) => {
        setActiveFilterTypes((prev) => new Set(prev).add(filterValue))
    }

    const handleDateRangeClear = () => {
        onDateRangeChange(null, null)
        setActiveFilterTypes((prev) => {
            const next = new Set(prev)
            next.delete('lastUpdatedAt')
            return next
        })
    }

    const handleInUseByAIClear = () => {
        onInUseByAIChange(null)
        setActiveFilterTypes((prev) => {
            const next = new Set(prev)
            next.delete('inUseByAI')
            return next
        })
    }

    return (
        <div
            className={classNames(css.tableContainer, {
                [css.searchEmptyTable]: isSearchEmptyPage,
            })}
        >
            <TableToolbar<GroupedKnowledgeItem>
                table={table}
                topRow={{
                    left: [
                        {
                            key: 'mySearch',
                            content: (
                                <SearchInput
                                    value={searchTerm}
                                    onChange={onSearchChange}
                                    placeholder="Search..."
                                />
                            ),
                        },
                        ...(activeFilterTypes.has('lastUpdatedAt')
                            ? [
                                  {
                                      key: 'dateFilter',
                                      content: (
                                          <LastUpdatedDateFilter
                                              startDate={dateRange.startDate}
                                              endDate={dateRange.endDate}
                                              onChange={onDateRangeChange}
                                              onClear={handleDateRangeClear}
                                          />
                                      ),
                                  },
                              ]
                            : []),
                        ...(activeFilterTypes.has('inUseByAI')
                            ? [
                                  {
                                      key: 'inUseByAIFilter',
                                      content: (
                                          <InUseByAIFilter
                                              value={inUseByAIFilter}
                                              onChange={onInUseByAIChange}
                                              onClear={handleInUseByAIClear}
                                          />
                                      ),
                                  },
                              ]
                            : []),
                        ...(activeFilterTypes.size < FILTER_OPTIONS.length
                            ? [
                                  {
                                      key: 'addFilter',
                                      content: (
                                          <AddFilterButton
                                              options={FILTER_OPTIONS.filter(
                                                  (option) =>
                                                      !activeFilterTypes.has(
                                                          option.value,
                                                      ),
                                              )}
                                              onOptionSelect={
                                                  handleFilterSelect
                                              }
                                          />
                                      ),
                                  },
                              ]
                            : []),
                    ],
                }}
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
                        {
                            key: 'bulkActions',
                            content: (
                                <BulkActions
                                    table={table}
                                    helpCenterIds={{
                                        guidanceHelpCenterId,
                                        faqHelpCenterId,
                                        snippetHelpCenterId,
                                    }}
                                    isSearchActive={isSearchActive}
                                    onClearSearch={clearSearch}
                                    activeContentType={selectedTypeFilter}
                                    shopName={shopName}
                                />
                            ),
                        },
                    ],
                }}
            />

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
