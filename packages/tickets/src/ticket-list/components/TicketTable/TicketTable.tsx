import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { usePrevious } from '@repo/hooks'
import { useUserDateTimePreferences } from '@repo/preferences'
import { useHistory } from 'react-router-dom'

import {
    createLocalStoragePersistence,
    DataTable,
    DataTablePagination,
    toast,
} from '@gorgias/axiom'
import type { RowSelectionState, SortingState } from '@gorgias/axiom'
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
import { TicketListEmptyPlaceholder } from '../TicketListEmptyPlaceholder'
import { parseSortOrder } from '../TicketListHeader/SortOrderDropdown'
import { TicketTableBulkActions } from './components/TicketTableBulkActions'
import { TicketTableColumnEditingFooter } from './components/TicketTableColumnEditingFooter'
import { createTicketTableColumns } from './TicketTableColumns'

import css from './TicketTable.module.less'

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

function areColumnsEqual(left: string[], right: string[]) {
    return (
        left.length === right.length &&
        left.every((column, index) => column === right[index])
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
    const hasSelection = useMemo(
        () => Object.values(rowSelection).some(Boolean),
        [rowSelection],
    )
    const { query, filters } = useTicketSearchUrlState()
    const [searchCursor, setSearchCursor] = useState<string | undefined>()

    const { data: viewResponse } = useGetView(viewId, {
        query: {
            enabled: !isDraftView,
        },
    })
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
        currentPageIndex,
        onPageChange,
        onPageSizeChange,
        onSortChange,
        onRefresh,
        pageSize,
        sortOrder,
        error,
    } = useTicketTableData({
        viewId,
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

    const placeholderKind = getPlaceholderKind({
        view,
        hasError: !!error,
        isEmpty: items.length === 0,
    })
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
    }, [])

    useEffect(() => {
        viewVisibleTickets(items)
    }, [items, viewVisibleTickets])

    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: displayedTicketIds,
    })
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const dateTimePreferences = useUserDateTimePreferences()

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
            history.push(`/app/ticket/${ticket.id}`)
        },
        [history, items, markAsRead, onNavigateToTicket, searchTracking],
    )

    const { field: currentSortField, direction: currentSortDirection } =
        parseSortOrder(sortOrder)
    const sortingInitial: SortingState = currentSortField
        ? [{ id: currentSortField.id, desc: currentSortDirection === 'desc' }]
        : []

    const {
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
                translationMap,
                shouldShowTranslatedContent: shouldShowTranslatedContent as (
                    language?: Language | null,
                ) => boolean,
                currentUserId,
                dateTimePreferences,
                isSearchMode,
            }),
        [
            currentUserId,
            dateTimePreferences,
            isSearchMode,
            shouldShowTranslatedContent,
            translationMap,
        ],
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
        hasSelectedAll: false,
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
    const localStoragePersistence = useMemo(
        () =>
            isDraftView
                ? undefined
                : createLocalStoragePersistence(
                      isSearchMode
                          ? `ticket-table-${viewId}-search`
                          : `ticket-table-${viewId}`,
                  ),
        [isDraftView, isSearchMode, viewId],
    )

    const handleResetToDefault = useCallback(() => {
        if (!localStoragePersistence) {
            return
        }

        localStoragePersistence.clear()
        setTableVersion((currentVersion) => currentVersion + 1)
    }, [localStoragePersistence])

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

    if (shouldShowErrorPlaceholder) {
        return (
            <TicketListEmptyPlaceholder
                isLoading={false}
                emptyStateVariant={placeholderKind}
                isInboxView={isInboxView}
                onRefresh={onRefresh}
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
                    enable: true,
                    localStorage: localStoragePersistence,
                }}
                data={items}
                columns={columns}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                overflow="scroll"
                selection={{
                    enable: true,
                    multiple: true,
                    value: rowSelection,
                    onChange: setRowSelection,
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
                    value: { pageIndex: currentPageIndex, pageSize },
                    hasNextPage,
                    hasPreviousPage,
                    onPageChange,
                    onPageSizeChange,
                }}
                columnEditing={{
                    enable: true,
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
                    />
                )}
            >
                <TicketTableBulkActions
                    viewId={viewId}
                    selectedCount={selectedTicketIds.size}
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
                    columnEditingFooter={({
                        visibleColumns,
                        orderedColumns,
                        setIsOpen,
                    }) => {
                        if (!shouldShowColumnEditingFooter) {
                            return undefined
                        }

                        const orderedVisibleColumns = orderedColumns.filter(
                            (column) => visibleColumns.includes(column),
                        )
                        const hasDivergedFromSavedView = !areColumnsEqual(
                            orderedVisibleColumns,
                            defaultVisibleColumns,
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
