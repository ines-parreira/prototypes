import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'
import moment from 'moment-timezone'

import {
    flexRender,
    HeaderRowGroup,
    TableBodyContent,
    TableCell,
    TableHeader,
    TablePagination,
    TableRoot,
    TableRow,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'
import type { Row, SortingState } from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    EmptyStateNoSearchResults,
    EmptyStateWrapper,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/EmptyStates'
import type { FilterOption } from 'pages/aiAgent/KnowledgeHub/Table/AddFilterButton'
import { AddFilterButton } from 'pages/aiAgent/KnowledgeHub/Table/AddFilterButton'
import { BulkActions } from 'pages/aiAgent/KnowledgeHub/Table/BulkActions/BulkActions'
import {
    COLUMN_IDS,
    getColumns,
    METRICS_COLUMN_PREFIX,
} from 'pages/aiAgent/KnowledgeHub/Table/columns'
import { InUseByAIFilter } from 'pages/aiAgent/KnowledgeHub/Table/InUseByAIFilter'
import { ItemCount } from 'pages/aiAgent/KnowledgeHub/Table/ItemCount'
import { LastUpdatedDateFilter } from 'pages/aiAgent/KnowledgeHub/Table/LastUpdatedDateFilter'
import { MetricsDateRangeDisplay } from 'pages/aiAgent/KnowledgeHub/Table/MetricsDateRangeDisplay'
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

import { useKnowledgeHubSortingPreference } from '../hooks/useKnowledgeHubSortingPreference'
import { KnowledgeType as KnowledgeTypeEnum } from '../types'
import { applyStableRowOrder, sortData } from './KnowledgeHubTable.utils'

import css from './KnowledgeHubTable.less'

const FILTER_OPTIONS: FilterOption[] = [
    { label: 'Last updated date', value: 'lastUpdatedAt' },
    { label: 'In use by AI Agent', value: 'inUseByAI' },
]

type KnowledgeHubTableProps = {
    data: KnowledgeItem[]
    metricsDateRange: { start_datetime: string; end_datetime: string }
    isMetricsEnabled: boolean
    isMetricsLoading?: boolean
    isLoading?: boolean
    onRowClick: (data: GroupedKnowledgeItem) => void
    onGuidanceRowClick?: (articleId: number) => void
    onFaqRowClick?: (articleId: number) => void
    onSnippetRowClick?: (articleId: number, type: KnowledgeType) => void
    onFaqEditorOpen?: () => void
    selectedFolder: GroupedKnowledgeItem | null
    selectedArticleType?: string
    selectedArticleId?: string
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
    clearSearchParams: () => void
}

export const KnowledgeHubTable = ({
    data,
    metricsDateRange,
    isMetricsEnabled,
    isMetricsLoading = false,
    isLoading = false,
    onRowClick,
    onGuidanceRowClick,
    onFaqRowClick,
    onSnippetRowClick,
    onFaqEditorOpen,
    selectedFolder,
    selectedArticleType,
    selectedArticleId,
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
    clearSearchParams,
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

    const availableColumnIds = useMemo(() => {
        const baseColumns = [
            COLUMN_IDS.TITLE,
            COLUMN_IDS.LAST_UPDATED_AT,
            COLUMN_IDS.IN_USE_BY_AI,
        ]
        if (isMetricsEnabled) {
            return [
                ...baseColumns,
                COLUMN_IDS.METRICS_TICKETS,
                COLUMN_IDS.METRICS_HANDOVER_TICKETS,
                COLUMN_IDS.METRICS_CSAT,
            ]
        }
        return baseColumns
    }, [isMetricsEnabled])

    const { sortState, setSortState } =
        useKnowledgeHubSortingPreference(availableColumnIds)

    const sortedRowIdsRef = useRef<string[] | null>(null)
    const cachedSortStateRef = useRef<SortingState | null>(null)

    const tableIsLoading = useMemo(() => {
        const isMetricSort =
            sortState.length > 0 &&
            sortState[0].id.startsWith(METRICS_COLUMN_PREFIX)

        return (
            isLoading || (isMetricsLoading && isMetricsEnabled && isMetricSort)
        )
    }, [isLoading, isMetricsLoading, isMetricsEnabled, sortState])

    const handleColumnClick = useCallback(
        (columnId: string) => {
            setSortState((prev) => {
                if (prev.length > 0 && prev[0].id === columnId) {
                    return [{ id: columnId, desc: !prev[0].desc }]
                }
                return [{ id: columnId, desc: false }]
            })
        },
        [setSortState],
    )

    const { guidanceActions: availableActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const isSearchActive = Boolean(searchTerm)
    const hasActiveFilters = Boolean(
        dateRange.startDate || dateRange.endDate || inUseByAIFilter !== null,
    )
    const hasInUseByAIFilter = inUseByAIFilter !== null

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

    // First, apply filtering and grouping
    const filteredAndGroupedData = useMemo(() => {
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

    // Apply manual sorting OR stable row order
    const displayData = useMemo(() => {
        if (sortState.length === 0) {
            sortedRowIdsRef.current = null
            cachedSortStateRef.current = null
            return filteredAndGroupedData
        }

        const sortStateChanged =
            !cachedSortStateRef.current ||
            sortState[0]?.id !== cachedSortStateRef.current[0]?.id ||
            sortState[0]?.desc !== cachedSortStateRef.current[0]?.desc

        if (sortStateChanged) {
            const sortedData = sortData(filteredAndGroupedData, sortState)
            sortedRowIdsRef.current = sortedData.map((row) => String(row.id))

            // Metrics load asynchronously — defer caching the sort state until
            // metric values are available so the next render re-sorts with real data.
            const awaitingMetrics =
                sortState[0].id.startsWith(METRICS_COLUMN_PREFIX) &&
                !filteredAndGroupedData.some(
                    (item) => item.metrics !== undefined,
                )

            if (!awaitingMetrics) {
                cachedSortStateRef.current = sortState
            }

            return sortedData
        }

        if (!sortedRowIdsRef.current || sortedRowIdsRef.current.length === 0) {
            const sortedData = sortData(filteredAndGroupedData, sortState)
            sortedRowIdsRef.current = sortedData.map((row) => String(row.id))
            return sortedData
        }

        return applyStableRowOrder(
            filteredAndGroupedData,
            sortedRowIdsRef.current,
        )
    }, [filteredAndGroupedData, sortState])

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

    const renderRows = useCallback(
        (rows: Row<GroupedKnowledgeItem>[]) => {
            return rows.map((row) => {
                const isSelectedArticle =
                    !!selectedArticleId &&
                    !!selectedArticleType &&
                    row.original.id === selectedArticleId &&
                    row.original.type === selectedArticleType

                return (
                    <TableRow
                        key={row.id}
                        data-name="table-body-row"
                        data-state={
                            row.getIsSelected() ? 'selected' : undefined
                        }
                        data-selected-article={isSelectedArticle}
                        aria-selected={row.getIsSelected()}
                        className={classNames({
                            [css.selectedRow]: isSelectedArticle,
                        })}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                )
            })
        },
        [selectedArticleId, selectedArticleType],
    )

    const columnsWithHighlight = useMemo(() => {
        return getColumns(
            searchTerm,
            handleRowClick,
            availableActions,
            guidanceHelpCenterId,
            isMetricsEnabled ? metricsDateRange : undefined,
            isMetricsEnabled ? outcomeCustomFieldId : undefined,
            isMetricsEnabled ? intentCustomFieldId : undefined,
            isMetricsLoading,
            undefined, // shopIntegrationId (not currently used)
            sortState, // Pass sort state
            handleColumnClick, // Pass click handler
        )
    }, [
        searchTerm,
        handleRowClick,
        availableActions,
        guidanceHelpCenterId,
        metricsDateRange,
        outcomeCustomFieldId,
        intentCustomFieldId,
        isMetricsEnabled,
        isMetricsLoading,
        sortState,
        handleColumnClick,
    ])

    // Custom sorting - no TanStack sorting, we handle column clicks manually
    const table = useTable<GroupedKnowledgeItem>({
        data: displayData,
        columns: columnsWithHighlight,
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 50,
            initialPageIndex: 0,
        },
        selectionConfig: {
            enableRowSelection: (row: { original: GroupedKnowledgeItem }) => {
                return !row.original.isGrouped
            },
            enableMultiRowSelection: true,
        },
        additionalOptions: {
            // TanStack Table requires string row IDs for consistent internal tracking
            getRowId: (row) => String(row.id),
        },
    })

    const prevSelectedFolderRef = useRef(selectedFolder)

    const handleDateRangeClear = useCallback(() => {
        onDateRangeChange(null, null)
        setActiveFilterTypes((prev) => {
            const next = new Set(prev)
            next.delete('lastUpdatedAt')
            return next
        })
    }, [onDateRangeChange])

    const handleInUseByAIClear = useCallback(() => {
        onInUseByAIChange(null)
        setActiveFilterTypes((prev) => {
            const next = new Set(prev)
            next.delete('inUseByAI')
            return next
        })
    }, [onInUseByAIChange])

    // Sync activeFilterTypes with filter values (e.g., when back button clears filters)
    useEffect(() => {
        setActiveFilterTypes((prev) => {
            const next = new Set(prev)
            let hasChanges = false

            // Remove lastUpdatedAt filter if either date is null
            // When either date is missing, the filter shows placeholder which we want to hide
            if (
                (!dateRange.startDate || !dateRange.endDate) &&
                prev.has('lastUpdatedAt')
            ) {
                next.delete('lastUpdatedAt')
                hasChanges = true
            }

            // Remove inUseByAI filter if value is null
            if (inUseByAIFilter === null && prev.has('inUseByAI')) {
                next.delete('inUseByAI')
                hasChanges = true
            }

            return hasChanges ? next : prev
        })
    }, [dateRange.startDate, dateRange.endDate, inUseByAIFilter])

    useEffect(() => {
        const prev = prevSelectedFolderRef.current
        const current = selectedFolder

        const isSnippetFolder = (folder: GroupedKnowledgeItem | null) =>
            folder &&
            (folder.type === KnowledgeTypeEnum.Document ||
                folder.type === KnowledgeTypeEnum.URL ||
                folder.type === KnowledgeTypeEnum.Domain)

        const currentIsSnippetFolder = isSnippetFolder(current)
        const prevIsSnippetFolder = isSnippetFolder(prev)

        // Only clear filters when transitioning to a DIFFERENT snippet folder
        const isEnteringSnippetFolder =
            currentIsSnippetFolder &&
            current !== null &&
            (!prev || prev.source !== current.source)

        const isExitingFolder = prev && !current

        if (
            isEnteringSnippetFolder ||
            (isExitingFolder && prevIsSnippetFolder)
        ) {
            table.resetRowSelection()
            handleDateRangeClear()
            handleInUseByAIClear()
        }

        prevSelectedFolderRef.current = current
    }, [selectedFolder, table, handleDateRangeClear, handleInUseByAIClear])

    const isSearchEmptyPage =
        !isLoading &&
        (searchTerm ||
            dateRange.startDate ||
            dateRange.endDate ||
            inUseByAIFilter !== null) &&
        displayData.length === 0

    const clearSearch = useCallback(() => {
        clearSearchParams()
        setActiveFilterTypes(new Set())
    }, [clearSearchParams])

    const handleFilterSelect = useCallback((filterValue: string) => {
        setActiveFilterTypes((prev) => new Set(prev).add(filterValue))
    }, [])

    if (!isSearchEmptyPage && displayData.length === 0 && !tableIsLoading) {
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

    return (
        <div
            className={classNames(css.tableContainer, {
                [css.searchEmptyTable]: isSearchEmptyPage,
            })}
            data-metrics-enabled={isMetricsEnabled}
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
                                    hasActiveFilters={hasActiveFilters}
                                    hasInUseByAIFilter={hasInUseByAIFilter}
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
                    right: isMetricsEnabled
                        ? [
                              {
                                  key: 'metricsDateRange',
                                  content: (
                                      <MetricsDateRangeDisplay
                                          dateRange={metricsDateRange}
                                      />
                                  ),
                              },
                          ]
                        : [],
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
                    isLoading={tableIsLoading}
                    rows={table.getRowModel().rows}
                    columnCount={table.getAllColumns().length}
                    table={table}
                    renderRows={renderRows}
                    renderEmptyStateComponent={() => {
                        return (
                            <EmptyStateNoSearchResults
                                clearSearch={clearSearch}
                            />
                        )
                    }}
                />
            </TableRoot>
            <div
                className={classNames(
                    css.pagination,
                    (displayData.length <= 50 || isSearchEmptyPage) &&
                        css.hidden,
                )}
            >
                <TableToolbar<GroupedKnowledgeItem>
                    table={table}
                    bottomRow={{
                        right: [
                            {
                                key: 'pagination',
                                content: (
                                    <TablePagination
                                        table={table}
                                        pageSizeOptions={[50, 100]}
                                    />
                                ),
                            },
                        ],
                    }}
                />
            </div>
        </div>
    )
}
