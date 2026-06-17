import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import moment from 'moment-timezone'

import {
    Box,
    DataTable,
    DataTableHeader,
    DataTableItemCount,
    DataTablePagination,
    Panel,
} from '@gorgias/axiom'
import type { Row, RowSelectionState, SortingState } from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { DocumentFilters } from 'pages/aiAgent/KnowledgeHub/DocumentFilters/DocumentFilters'
import {
    EmptyStateNoSearchResults,
    EmptyStateWrapper,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/EmptyStates'
import type { FilterOption } from 'pages/aiAgent/KnowledgeHub/Table/AddFilterButton'
import { AddFilterButton } from 'pages/aiAgent/KnowledgeHub/Table/AddFilterButton'
import { BulkActions } from 'pages/aiAgent/KnowledgeHub/Table/BulkActions/BulkActions'
import type { SyncStatusData } from 'pages/aiAgent/KnowledgeHub/Table/columns'
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

const PAGE_SIZE = 50

const TABLE_MIN_WIDTH = 942

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
    onDocumentFilterChange?: (filter: KnowledgeType | null) => void
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
    syncStatusData?: SyncStatusData
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
    onDocumentFilterChange,
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
    syncStatusData,
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

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    const [overflow, setOverflow] = useState<'constrain' | 'scroll'>(
        'constrain',
    )

    const measurePanelRef = useCallback((node: HTMLDivElement | null) => {
        resizeObserverRef.current?.disconnect()
        if (!node) {
            return
        }
        const update = (width: number) =>
            setOverflow(width < TABLE_MIN_WIDTH ? 'scroll' : 'constrain')
        update(node.clientWidth)
        resizeObserverRef.current = new ResizeObserver((entries) =>
            update(entries[0].contentRect.width),
        )
        resizeObserverRef.current.observe(node)
    }, [])

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
            selectedFolder ?? undefined,
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
            syncStatusData,
            selectedArticleId,
            selectedArticleType,
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
        syncStatusData,
        selectedArticleId,
        selectedArticleType,
    ])

    const rowSelection = useMemo<RowSelectionState>(() => {
        const selection: RowSelectionState = {}
        displayData.forEach((item, index) => {
            if (!item.isGrouped && selectedIds.has(String(item.id))) {
                selection[index] = true
            }
        })
        return selection
    }, [displayData, selectedIds])

    const handleSelectionChange = useCallback(
        (next: RowSelectionState) => {
            const ids = new Set<string>()
            Object.entries(next).forEach(([index, isSelected]) => {
                if (!isSelected) {
                    return
                }
                const item = displayData[Number(index)]
                if (item && !item.isGrouped) {
                    ids.add(String(item.id))
                }
            })
            setSelectedIds(ids)
        },
        [displayData],
    )

    const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

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
            clearSelection()
            handleDateRangeClear()
            handleInUseByAIClear()
        }

        prevSelectedFolderRef.current = current
    }, [
        selectedFolder,
        clearSelection,
        handleDateRangeClear,
        handleInUseByAIClear,
    ])

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

    const contentFilters =
        !selectedFolder && onDocumentFilterChange ? (
            <DocumentFilters
                selectedFilter={selectedTypeFilter}
                onFilterChange={onDocumentFilterChange}
            />
        ) : null

    if (!isSearchEmptyPage && displayData.length === 0 && !tableIsLoading) {
        return (
            <div className={css.emptyStateContainer}>
                {contentFilters}
                <div className={css.emptyTable}>
                    <EmptyStateWrapper
                        shopName={shopName}
                        documentFilter={selectedTypeFilter}
                        articles={displayData}
                        helpCenterId={faqHelpCenterId}
                        onFaqEditorOpen={onFaqEditorOpen}
                    />
                </div>
            </div>
        )
    }

    const showPagination = !isSearchEmptyPage && displayData.length > PAGE_SIZE

    return (
        <Panel
            ref={measurePanelRef}
            className={css.panel}
            w="100%"
            withoutBorder
            data-metrics-enabled={isMetricsEnabled}
            data-no-results={isSearchEmptyPage}
        >
            <DataTable<GroupedKnowledgeItem>
                data={displayData}
                columns={columnsWithHighlight}
                isLoading={tableIsLoading}
                stickyToolbar
                overflow={overflow}
                sorting={{ enable: false }}
                selection={{
                    enable: (row: Row<GroupedKnowledgeItem>) =>
                        !row.original.isGrouped,
                    multiple: true,
                    value: rowSelection,
                    onChange: handleSelectionChange,
                }}
                pagination={{
                    enable: showPagination,
                    defaultValue: { pageIndex: 0, pageSize: PAGE_SIZE },
                }}
                renderEmptyState={() => (
                    <EmptyStateNoSearchResults clearSearch={clearSearch} />
                )}
            >
                <DataTableHeader>
                    <Box flexDirection="column" gap="md" flex={1} width="100%">
                        {contentFilters}
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            gap="sm"
                            width="100%"
                        >
                            <SearchInput
                                value={searchTerm}
                                onChange={onSearchChange}
                                placeholder="Search..."
                            />
                            {activeFilterTypes.has('lastUpdatedAt') && (
                                <LastUpdatedDateFilter
                                    startDate={dateRange.startDate}
                                    endDate={dateRange.endDate}
                                    onChange={onDateRangeChange}
                                    onClear={handleDateRangeClear}
                                />
                            )}
                            {activeFilterTypes.has('inUseByAI') && (
                                <InUseByAIFilter
                                    value={inUseByAIFilter}
                                    onChange={onInUseByAIChange}
                                    onClear={handleInUseByAIClear}
                                />
                            )}
                            {activeFilterTypes.size < FILTER_OPTIONS.length && (
                                <AddFilterButton
                                    options={FILTER_OPTIONS.filter(
                                        (option) =>
                                            !activeFilterTypes.has(
                                                option.value,
                                            ),
                                    )}
                                    onOptionSelect={handleFilterSelect}
                                />
                            )}
                        </Box>
                        <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                        >
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                gap="sm"
                            >
                                <ItemCount
                                    isSearchActive={isSearchActive}
                                    hasActiveFilters={hasActiveFilters}
                                    hasInUseByAIFilter={hasInUseByAIFilter}
                                />
                                <BulkActions
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
                            </Box>
                            {isMetricsEnabled && (
                                <MetricsDateRangeDisplay days={28} />
                            )}
                        </Box>
                    </Box>
                </DataTableHeader>
                <DataTableItemCount>{() => null}</DataTableItemCount>
                {showPagination && (
                    <DataTablePagination pageSizeOptions={[50, 100]} />
                )}
            </DataTable>
        </Panel>
    )
}
