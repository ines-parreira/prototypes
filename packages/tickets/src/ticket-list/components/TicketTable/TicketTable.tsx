import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { useUserDateTimePreferences } from '@repo/preferences'
import { useViewCount } from '@repo/views'
import { useHistory } from 'react-router-dom'
import { usePrevious } from '@gorgias/toolkit-react'

import {
    Button,
    createLocalStoragePersistence,
    DataTable,
    DataTableBulkActions,
    DataTableColumnEditing,
    DataTableItemCount,
    DataTablePagination,
    Text,
    toast,
} from '@gorgias/axiom'
import type {
    PaginationState,
    RowSelectionState,
    SelectAllEvent,
    SortingState,
} from '@gorgias/axiom'
import { useGetView } from '@gorgias/helpdesk-queries'
import { ViewVisibility } from '@gorgias/helpdesk-types'
import type {
    Language,
    TicketCompact,
    ViewField,
} from '@gorgias/helpdesk-types'

import { useCurrentUserId } from '../../../hooks/useCurrentUserId'
import { useCurrentUserLanguagePreferences } from '../../../translations/hooks/useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../../../translations/hooks/useTicketsTranslatedProperties'
import {
    EmptyViewsState,
    isInboxView as getIsInboxView,
} from '../../../utils/views'
import { useBulkActionMenuState } from '../../hooks/useBulkActionMenuState'
import { useIsTrashLikeView } from '../../hooks/useIsTrashLikeView'
import { useMarkTicketAsRead } from '../../hooks/useMarkTicketAsRead'
import { useTicketListActions } from '../../hooks/useTicketListActions'
import { useTicketSearchUrlState } from '../../hooks/useTicketSearchUrlState'
import { useTicketTableBulkActionShortcuts } from '../../hooks/useTicketTableBulkActionShortcuts'
import { useTicketTableColumnVisibility } from '../../hooks/useTicketTableColumnVisibility'
import type { DirtyViewInput } from '../../hooks/useTicketTableData'
import { useTicketTableData } from '../../hooks/useTicketTableData'
import { useViewVisibleTickets } from '../../hooks/useViewVisibleTickets'
import type { SearchTracking } from '../../types/searchTracking'
import { getPlaceholderKind } from '../../utils/getPlaceholderKind'
import { getTicketTableDisplayRow } from '../../utils/getTicketTableDisplayRow'
import { isInaccessibleViewItemsError } from '../../utils/isInaccessibleViewItemsError'
import { TicketListEmptyPlaceholder } from '../TicketListEmptyPlaceholder'
import { parseSortOrder } from '../TicketListHeader/SortOrderDropdown'
import { TicketTableBulkActions } from './components/TicketTableBulkActions'
import { TicketTableColumnEditingFooter } from './components/TicketTableColumnEditingFooter'
import { createTicketTableColumns } from './TicketTableColumns'
import type { TicketTableRow } from './TicketTableColumns'
import { TicketTablePaginationShortcuts } from './TicketTablePaginationShortcuts'

import css from './TicketTable.module.less'

const DEFAULT_PAGINATION: PaginationState = {
    pageIndex: 0,
    pageSize: 20,
}
const VIRTUALIZATION_PAGE_SIZE_THRESHOLD = 50
const VIRTUALIZATION_OVERSCAN = 20

type Props = {
    viewId: number
    isSearchMode?: boolean
    onSearchResultCountChange?: (count?: number) => void
    onFixFilters?: () => void
    onApplyMacro?: (ticketIds: number[]) => void
    onNavigateToTicket?: () => void
    dirtyView?: DirtyViewInput
    isDraftView?: boolean
    draftFields?: ViewField[]
    onDraftFieldsChange?: (fields: ViewField[]) => void
    searchTracking?: SearchTracking
}

export function getTicketTableErrorMessage(error: unknown) {
    /* v8 ignore next -- codecov incorrectly reporting partial coverage */
    if (error instanceof Error) {
        return error.message
    }

    return undefined
}

function areColumnsEqual(left: string[], right: string[]) {
    return (
        left.length === right.length &&
        left.every((column, index) => column === right[index])
    )
}

function excludeDisplayOnlyColumns(columns: string[]) {
    return columns.filter(
        (column) => column !== 'select' && column !== 'ticket',
    )
}

function TicketTableComponent({
    viewId,
    isSearchMode = false,
    onSearchResultCountChange,
    onFixFilters,
    onApplyMacro,
    onNavigateToTicket,
    dirtyView,
    isDraftView = false,
    draftFields,
    onDraftFieldsChange,
    searchTracking,
}: Props) {
    const history = useHistory()
    const { currentUserId } = useCurrentUserId()
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [isAllSelected, setIsAllSelected] = useState(false)
    const hasSelection = useMemo(
        () => isAllSelected || Object.values(rowSelection).some(Boolean),
        [isAllSelected, rowSelection],
    )
    const { query, filters } = useTicketSearchUrlState()
    const [searchCursor, setSearchCursor] = useState<string | undefined>()
    const viewCount = useViewCount(viewId)

    // Mirror of the DataTable's effective pagination state. Axiom emits this
    // once on mount after persistence rehydration.
    const [pagination, setPagination] = useState<PaginationState | undefined>()
    const handlePaginationReset = useCallback(() => {
        setPagination((prev) => ({
            ...(prev ?? DEFAULT_PAGINATION),
            pageIndex: 0,
        }))
    }, [])

    const {
        data: viewResponse,
        error: viewError,
        refetch: refetchView,
    } = useGetView(viewId, {
        query: {
            enabled: !isDraftView,
        },
    })
    const handleRefreshView = () => {
        void refetchView()
    }
    const view = viewResponse?.data
    const shouldShowColumnEditingFooter =
        !isDraftView && view?.visibility !== ViewVisibility.Private
    const isInboxView = isSearchMode
        ? false
        : viewResponse
          ? getIsInboxView(view)
          : undefined

    const {
        items,
        isLoading,
        hasNextPage,
        hasPreviousPage,
        totalResources,
        onPageChange,
        onSortChange,
        onRefresh,
        sortOrder,
        error,
    } = useTicketTableData({
        viewId,
        pageIndex: pagination?.pageIndex ?? DEFAULT_PAGINATION.pageIndex,
        pageSize: pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize,
        enabled: pagination !== undefined,
        onPaginationReset: handlePaginationReset,
        dirtyView,
        searchView: isSearchMode
            ? {
                  enabled: true,
                  query,
                  filters,
                  cursor: searchCursor,
                  setCursor: setSearchCursor,
              }
            : undefined,
        enablePersistedUpdates: !view?.deactivated_datetime,
        pauseUpdates: hasSelection,
        isDraftView,
        searchTracking,
    })
    const canSelectAllInView = !isDraftView && (hasNextPage || hasPreviousPage)

    const placeholderKind = getPlaceholderKind({
        view,
        error,
        isEmpty: items.length === 0,
    })
    const viewErrorPlaceholderKind =
        !isSearchMode && !viewResponse && viewError
            ? isInaccessibleViewItemsError(viewError)
                ? EmptyViewsState.Inaccessible
                : EmptyViewsState.Error
            : null
    const errorMessage = getTicketTableErrorMessage(error)
    const { viewVisibleTickets } = useViewVisibleTickets()
    const displayedTicketIds = useMemo(
        () =>
            items
                .map((ticket) => ticket.id)
                .filter((id): id is number => id !== undefined),
        [items],
    )
    const displayedTicketIdsKey = displayedTicketIds.join(',')
    const previousDisplayedTicketIdsKey = usePrevious(displayedTicketIdsKey)
    const previousSortOrder = usePrevious(sortOrder)
    const clearSelection = useCallback(() => {
        setRowSelection({})
        setIsAllSelected(false)
    }, [])

    const handleSelectAll = useCallback(
        ({ scope, selected }: SelectAllEvent) => {
            if (scope === 'all') {
                if (!selected) {
                    clearSelection()
                    return
                }

                setIsAllSelected(selected)
                return
            }

            if (!selected) {
                clearSelection()
                return
            }

            setIsAllSelected(false)
        },
        [clearSelection],
    )

    useEffect(() => {
        viewVisibleTickets(items)
    }, [items, viewVisibleTickets])

    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: displayedTicketIds,
    })
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const showTranslatedContent = shouldShowTranslatedContent as (
        language?: Language | null,
    ) => boolean
    const dateTimePreferences = useUserDateTimePreferences()

    const tableItems = useMemo<TicketTableRow[]>(
        () =>
            items.map((ticket) => {
                const displayRow = getTicketTableDisplayRow({
                    ticket,
                    translation: translationMap[ticket.id],
                    showTranslatedContent: showTranslatedContent(
                        ticket.language,
                    ),
                })

                return {
                    ...ticket,
                    displayCustomer: displayRow.customer,
                    displaySubject: displayRow.subject,
                    displayExcerpt: displayRow.excerpt,
                    displayTicketId: displayRow.ticketId,
                }
            }),
        [items, showTranslatedContent, translationMap],
    )

    const { markAsRead } = useMarkTicketAsRead()

    const handleRowClick = useCallback(
        (ticket: TicketCompact) => {
            const selectedIndex = items.findIndex(
                (item) => item.id === ticket.id,
            )
            if (selectedIndex >= 0) {
                searchTracking?.onSelection?.({
                    id: ticket.id,
                    index: selectedIndex,
                })
            }
            if (ticket.is_unread) markAsRead(ticket.id)
            onNavigateToTicket?.()
            // axiom's row-link wrapper preventDefaults the anchor when both
            // onRowClick and getRowHref are set, so SPA navigation must happen
            // here. The href on the underlying anchor still drives cmd/middle
            // click "open in new tab".
            history.push(`/app/ticket/${ticket.id}`)
        },
        [history, items, markAsRead, onNavigateToTicket, searchTracking],
    )

    const getRowHref = useCallback(
        (row: TicketTableRow) =>
            row.id !== undefined ? `/app/ticket/${row.id}` : undefined,
        [],
    )

    const { field: currentSortField, direction: currentSortDirection } =
        parseSortOrder(sortOrder)
    const sortingInitial: SortingState = currentSortField
        ? [{ id: currentSortField.id, desc: currentSortDirection === 'desc' }]
        : []

    const {
        defaultColumnOrder,
        defaultVisibleColumns,
        onLocalChange: onColumnVisibilityChange,
        onColumnOrderChange,
        saveForEveryone,
        canSaveForEveryone,
        isSavingForEveryone,
    } = useTicketTableColumnVisibility(viewId, {
        isDraftView,
        draftFields,
        onDraftFieldsChange,
    })
    // Remove this remount workaround once Axiom exposes a mounted column reset API.
    const [tableVersion, setTableVersion] = useState(0)

    const columns = useMemo(
        () =>
            createTicketTableColumns({
                currentUserId,
                dateTimePreferences,
            }),
        [currentUserId, dateTimePreferences],
    )

    const selectedTicketIds = useMemo(
        () =>
            new Set(
                Object.entries(rowSelection)
                    .filter(([, selected]) => !!selected)
                    .map(([rowId]) => items[Number(rowId)]?.id)
                    .filter((id): id is number => id !== undefined),
            ),
        [items, rowSelection],
    )
    const viewLabel = view?.name?.trim() || 'the view'

    const {
        isLoading: isBulkActionLoading,
        handleApplyMacro,
        handleAddTag,
        handleAssignTeam,
        handleAssignUser,
        handleChangePriority,
        handleExportTickets,
        handleMarkAsRead,
        handleMarkAsUnread,
        handleMoveToTrash,
        handleUndelete,
        handleDeleteForever,
        handleSetStatus,
    } = useTicketListActions({
        viewId,
        selectedTicketIds,
        visibleTicketIds: displayedTicketIds,
        hasSelectedAll: isAllSelected,
        onActionComplete: clearSelection,
        onApplyMacro,
    })
    const { canUseRestrictedBulkActions } = useBulkActionMenuState()
    const isTrashLikeView = useIsTrashLikeView(viewId, { isDraftView })
    const [isAssignUserOpen, setIsAssignUserOpen] = useState(false)
    const [isAddTagOpen, setIsAddTagOpen] = useState(false)

    useEffect(() => {
        if (
            previousDisplayedTicketIdsKey !== undefined &&
            previousDisplayedTicketIdsKey !== displayedTicketIdsKey
        ) {
            clearSelection()
            setIsAssignUserOpen(false)
            setIsAddTagOpen(false)
        }
    }, [clearSelection, displayedTicketIdsKey, previousDisplayedTicketIdsKey])

    useEffect(() => {
        if (
            previousSortOrder !== undefined &&
            previousSortOrder !== sortOrder
        ) {
            clearSelection()
            setIsAssignUserOpen(false)
            setIsAddTagOpen(false)
        }
    }, [clearSelection, previousSortOrder, sortOrder])

    useEffect(() => {
        if (!isSearchMode) {
            return
        }

        setSearchCursor(undefined)
    }, [filters, isSearchMode, query])

    useEffect(() => {
        onSearchResultCountChange?.(isSearchMode ? totalResources : undefined)
    }, [isSearchMode, onSearchResultCountChange, totalResources])

    useTicketTableBulkActionShortcuts({
        hasSelection,
        isBulkActionLoading,
        canUseRestrictedBulkActions,
        isTrashLikeView,
        handleOpenAssignUser: () => {
            setIsAddTagOpen(false)
            setIsAssignUserOpen(true)
        },
        handleOpenTags: () => {
            setIsAssignUserOpen(false)
            setIsAddTagOpen(true)
        },
        handleApplyMacro,
        handleSetStatus,
        handleMarkAsRead,
        handleMarkAsUnread,
        handleMoveToTrash,
        handleDeleteForever,
    })

    const handleUndeleteFromTrashView = useCallback(async () => {
        await handleUndelete({ removeFromCurrentViewCache: true })
    }, [handleUndelete])

    const persistenceId = isSearchMode
        ? `ticket-table-${viewId}-search`
        : `ticket-table-${viewId}`

    const handleResetToDefault = useCallback(() => {
        if (isDraftView) {
            return
        }

        const persistence = createLocalStoragePersistence(persistenceId)

        if (!persistence) {
            return
        }

        persistence.clear()
        setTableVersion((currentVersion) => currentVersion + 1)
    }, [isDraftView, persistenceId])

    const handleSaveForEveryone = useCallback(
        async (visibleColumns: string[]) => {
            try {
                await saveForEveryone(visibleColumns)
                toast.success('Columns saved for everyone')
            } catch {
                toast.error('Failed to save columns for everyone')
                throw new Error('Failed to save columns for everyone')
            }
        },
        [saveForEveryone],
    )

    const shouldShowErrorPlaceholder =
        placeholderKind === EmptyViewsState.Error && items.length === 0
    const shouldEnableVirtualization =
        (pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize) >=
        VIRTUALIZATION_PAGE_SIZE_THRESHOLD

    if (viewErrorPlaceholderKind) {
        return (
            <div className={css.container}>
                <TicketListEmptyPlaceholder
                    isLoading={false}
                    emptyStateVariant={viewErrorPlaceholderKind}
                    isInboxView={isInboxView}
                    onRefresh={
                        viewErrorPlaceholderKind === EmptyViewsState.Error
                            ? handleRefreshView
                            : undefined
                    }
                />
            </div>
        )
    }

    if (shouldShowErrorPlaceholder) {
        return (
            <TicketListEmptyPlaceholder
                isLoading={false}
                emptyStateVariant={placeholderKind}
                isInboxView={isInboxView}
                onRefresh={onRefresh}
                errorMessage={errorMessage}
            />
        )
    }

    if (!viewResponse && !isDraftView && !isSearchMode) {
        return (
            <div className={css.container}>
                <TicketListEmptyPlaceholder
                    isLoading={true}
                    emptyStateVariant={EmptyViewsState.Empty}
                    isInboxView={isInboxView}
                />
            </div>
        )
    }

    return (
        <div className={css.container}>
            <DataTable
                key={
                    isSearchMode
                        ? `${viewId}-search-${query}-${searchCursor ?? ''}-${tableVersion}`
                        : `${viewId}-${sortOrder}-${tableVersion}`
                }
                persistence={{
                    enable: !isDraftView,
                    id: persistenceId,
                }}
                data={tableItems}
                columns={columns}
                isLoading={isLoading}
                estimatedRowHeight={58}
                onRowClick={handleRowClick}
                getRowHref={getRowHref}
                overflow="scroll"
                virtualization={{
                    enable: shouldEnableVirtualization,
                    overscan: VIRTUALIZATION_OVERSCAN,
                }}
                selection={{
                    enable: true,
                    multiple: true,
                    value: rowSelection,
                    onChange: setRowSelection,
                    ...(canSelectAllInView
                        ? {
                              isAllSelected,
                              onSelectAll: handleSelectAll,
                          }
                        : {}),
                }}
                sorting={{
                    enable: true,
                    manual: true,
                    value: sortingInitial,
                    onChange: onSortChange as (
                        updaterOrValue:
                            | SortingState
                            | ((old: SortingState) => SortingState),
                    ) => void,
                }}
                pagination={{
                    enable: true,
                    manual: true,
                    defaultValue: DEFAULT_PAGINATION,
                    value: pagination,
                    onChange: setPagination,
                    rowCount: viewCount,
                    hasNextPage,
                    hasPreviousPage,
                    onPageChange,
                }}
                columnEditing={{
                    enable: true,
                    defaultColumnOrder,
                    defaultVisibleColumns,
                    onVisibleColumnsChange: onColumnVisibilityChange,
                    onColumnOrderChange,
                }}
                renderEmptyState={() => (
                    <TicketListEmptyPlaceholder
                        isLoading={isLoading}
                        emptyStateVariant={
                            placeholderKind || EmptyViewsState.Empty
                        }
                        isInboxView={isInboxView}
                        onFixFilters={onFixFilters}
                        onRefresh={onRefresh}
                        errorMessage={errorMessage}
                    />
                )}
            >
                <DataTableItemCount>
                    {({ isAllSelected: itemCountIsAllSelected, text }) => {
                        if (itemCountIsAllSelected || isAllSelected) {
                            const viewLabel = view?.name?.trim() || 'the view'
                            return (
                                <>
                                    <TicketTablePaginationShortcuts
                                        isLoading={isLoading}
                                    />
                                    <Text size="sm">
                                        {viewCount != null
                                            ? `All ${viewCount} tickets in ${viewLabel} selected`
                                            : `All tickets in ${viewLabel} selected`}
                                    </Text>
                                </>
                            )
                        }
                        return (
                            <>
                                <TicketTablePaginationShortcuts
                                    isLoading={isLoading}
                                />
                                <Text size="sm">{text}</Text>
                            </>
                        )
                    }}
                </DataTableItemCount>
                <DataTableBulkActions<TicketTableRow>
                    selectAllAction={
                        canSelectAllInView
                            ? ({ onSelectAll }) => {
                                  const viewLabel =
                                      view?.name?.trim() || 'the view'
                                  return (
                                      <Button
                                          variant="tertiary"
                                          size="sm"
                                          onClick={onSelectAll}
                                      >
                                          {viewCount != null
                                              ? `Select all ${viewCount} tickets in ${viewLabel}`
                                              : `Select all tickets in ${viewLabel}`}
                                      </Button>
                                  )
                              }
                            : undefined
                    }
                >
                    {() => (
                        <TicketTableBulkActions
                            viewId={viewId}
                            isAllSelected={isAllSelected}
                            selectedTicketCount={selectedTicketIds.size}
                            totalTicketCount={viewCount}
                            viewName={viewLabel}
                            isAssignUserOpen={isAssignUserOpen}
                            isAddTagOpen={isAddTagOpen}
                            isDisabled={isBulkActionLoading}
                            onSetStatus={handleSetStatus}
                            onAssignUser={handleAssignUser}
                            onAssignTeam={handleAssignTeam}
                            onAddTag={handleAddTag}
                            onAssignUserOpenChange={setIsAssignUserOpen}
                            onAddTagOpenChange={setIsAddTagOpen}
                            onChangePriority={handleChangePriority}
                            onExportTickets={handleExportTickets}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAsUnread={handleMarkAsUnread}
                            onApplyMacro={handleApplyMacro}
                            onMoveToTrash={handleMoveToTrash}
                            onUndelete={handleUndeleteFromTrashView}
                            onDeleteForever={handleDeleteForever}
                        />
                    )}
                </DataTableBulkActions>
                <DataTableColumnEditing
                    footer={({ visibleColumns, orderedColumns, setIsOpen }) => {
                        if (!shouldShowColumnEditingFooter) {
                            return undefined
                        }

                        const orderedVisibleColumns = orderedColumns.filter(
                            (column) => visibleColumns.includes(column),
                        )
                        const comparableVisibleColumns =
                            excludeDisplayOnlyColumns(orderedVisibleColumns)
                        const comparableDefaultVisibleColumns =
                            excludeDisplayOnlyColumns(defaultVisibleColumns)
                        const hasDivergedFromSavedView = !areColumnsEqual(
                            comparableVisibleColumns,
                            comparableDefaultVisibleColumns,
                        )

                        if (!hasDivergedFromSavedView) {
                            return undefined
                        }

                        return (
                            <TicketTableColumnEditingFooter
                                visibleColumns={orderedVisibleColumns}
                                canSaveForEveryone={canSaveForEveryone}
                                isSavingForEveryone={isSavingForEveryone}
                                onClose={() => setIsOpen(false)}
                                onResetToDefault={handleResetToDefault}
                                onSaveForEveryone={handleSaveForEveryone}
                            />
                        )
                    }}
                />

                <DataTablePagination />
            </DataTable>
        </div>
    )
}

export const TicketTable = memo(TicketTableComponent)
