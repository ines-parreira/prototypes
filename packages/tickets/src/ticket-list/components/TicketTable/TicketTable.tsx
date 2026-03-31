import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePrevious } from '@repo/hooks'
import { useUserDateTimePreferences } from '@repo/preferences'
import { useHistory } from 'react-router-dom'

import { DataTable, DataTablePagination } from '@gorgias/axiom'
import type { RowSelectionState, SortingState } from '@gorgias/axiom'
import { useGetView } from '@gorgias/helpdesk-queries'
import type { Language, TicketCompact } from '@gorgias/helpdesk-types'

import { useCurrentUserLanguagePreferences } from '../../../translations/hooks/useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../../../translations/hooks/useTicketsTranslatedProperties'
import {
    EmptyViewsState,
    isInboxView as getIsInboxView,
} from '../../../utils/views'
import { useBulkActionMenuState } from '../../hooks/useBulkActionMenuState'
import { useIsTrashLikeView } from '../../hooks/useIsTrashLikeView'
import { useMarkTicketAsRead } from '../../hooks/useMarkTicketAsRead'
import { useSortOrder } from '../../hooks/useSortOrder'
import { useTicketListActions } from '../../hooks/useTicketListActions'
import { useTicketsList } from '../../hooks/useTicketsList'
import { useTicketTableBulkActionShortcuts } from '../../hooks/useTicketTableBulkActionShortcuts'
import { useTicketTableColumnVisibility } from '../../hooks/useTicketTableColumnVisibility'
import { useViewVisibleTickets } from '../../hooks/useViewVisibleTickets'
import { getPlaceholderKind } from '../../utils/getPlaceholderKind'
import { TicketListEmptyPlaceholder } from '../TicketListEmptyPlaceholder'
import {
    parseSortOrder,
    SORT_FIELDS,
} from '../TicketListHeader/SortOrderDropdown'
import { TicketTableBulkActions } from './components/TicketTableBulkActions'
import { createTicketTableColumns } from './TicketTableColumns'

import css from './TicketTable.module.less'

type Props = {
    viewId: number
    currentUserId?: number
    onFixFilters?: () => void
    onApplyMacro?: (ticketIds: number[]) => void
}

export function TicketTable({
    viewId,
    currentUserId,
    onFixFilters,
    onApplyMacro,
}: Props) {
    const history = useHistory()
    const [sortOrder, setSortOrder] = useSortOrder(viewId)

    const { data: viewResponse } = useGetView(viewId)
    const view = viewResponse?.data
    const isInboxView = viewResponse ? getIsInboxView(view) : undefined

    const [pageSize, setPageSize] = useState(20)
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const hasSelection = useMemo(
        () => Object.values(rowSelection).some(Boolean),
        [rowSelection],
    )

    const ticketsListParams = useMemo(
        () => ({ order_by: sortOrder, limit: pageSize }),
        [sortOrder, pageSize],
    )

    const {
        tickets,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        error,
        refetch,
    } = useTicketsList(viewId, {
        params: ticketsListParams,
        pauseUpdates: hasSelection,
        enableStaleUpdates: !view?.deactivated_datetime,
    })
    const placeholderKind = getPlaceholderKind({
        view,
        hasError: !!error,
        isEmpty: tickets.length === 0,
    })
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const dateTimePreferences = useUserDateTimePreferences()

    const { markAsRead } = useMarkTicketAsRead()

    const [currentPageIndex, setCurrentPageIndex] = useState(0)
    const clearSelection = useCallback(() => {
        setRowSelection({})
    }, [])

    const previousSortOrder = usePrevious(sortOrder)
    useEffect(() => {
        if (!previousSortOrder || previousSortOrder === sortOrder) return
        setCurrentPageIndex(0)
        clearSelection()
    }, [clearSelection, sortOrder, previousSortOrder])

    const prevTicketsLength = usePrevious(tickets.length)
    useEffect(() => {
        if (
            prevTicketsLength !== undefined &&
            tickets.length > prevTicketsLength &&
            tickets.length > (currentPageIndex + 1) * pageSize
        ) {
            setCurrentPageIndex((i) => i + 1)
        }
    }, [tickets.length, prevTicketsLength, currentPageIndex, pageSize])

    const displayedTickets = useMemo(
        () =>
            tickets.slice(
                currentPageIndex * pageSize,
                (currentPageIndex + 1) * pageSize,
            ),
        [tickets, currentPageIndex, pageSize],
    )
    const { viewVisibleTickets } = useViewVisibleTickets()

    useEffect(() => {
        viewVisibleTickets(displayedTickets)
    }, [displayedTickets, viewVisibleTickets])

    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: displayedTickets.map((ticket) => ticket.id),
    })
    const displayedTicketIds = useMemo(
        () => displayedTickets.map((ticket) => ticket.id),
        [displayedTickets],
    )
    const displayedTicketIdsKey = displayedTicketIds.join(',')
    const previousDisplayedTicketIdsKey = usePrevious(displayedTicketIdsKey)

    const handlePageChange = useCallback(
        (direction: 'next' | 'previous') => {
            if (direction === 'previous') {
                setCurrentPageIndex((i) => Math.max(0, i - 1))
                return
            }
            const nextPageStart = (currentPageIndex + 1) * pageSize
            if (nextPageStart < tickets.length) {
                setCurrentPageIndex((i) => i + 1)
            } else if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        },
        [
            currentPageIndex,
            pageSize,
            tickets.length,
            hasNextPage,
            isFetchingNextPage,
            fetchNextPage,
        ],
    )

    const handleSortingChange = useCallback(
        (
            updaterOrValue:
                | SortingState
                | ((old: SortingState) => SortingState),
        ) => {
            const { field: currentField, direction: currentDirection } =
                parseSortOrder(sortOrder)
            const currentSortingState: SortingState = currentField
                ? [{ id: currentField.id, desc: currentDirection === 'desc' }]
                : []

            const next =
                typeof updaterOrValue === 'function'
                    ? updaterOrValue(currentSortingState)
                    : updaterOrValue

            const [first] = next
            if (!first) return

            const field = SORT_FIELDS.find((f) => f.id === first.id)
            if (!field) return

            setSortOrder(first.desc ? field.desc : field.asc)
        },
        [sortOrder, setSortOrder],
    )

    const handleRowClick = useCallback(
        (ticket: TicketCompact) => {
            if (ticket.is_unread) markAsRead(ticket.id)
            history.push(`/app/views/${viewId}/${ticket.id}`)
        },
        [markAsRead, history, viewId],
    )

    const { field: currentSortField, direction: currentSortDirection } =
        parseSortOrder(sortOrder)
    const sortingInitial: SortingState = currentSortField
        ? [{ id: currentSortField.id, desc: currentSortDirection === 'desc' }]
        : []

    const { defaultVisibleColumns, onChange: onColumnVisibilityChange } =
        useTicketTableColumnVisibility(viewId)

    const columns = useMemo(
        () =>
            createTicketTableColumns({
                translationMap,
                shouldShowTranslatedContent: shouldShowTranslatedContent as (
                    language?: Language | null,
                ) => boolean,
                currentUserId,
                dateTimePreferences,
            }),
        [
            translationMap,
            shouldShowTranslatedContent,
            currentUserId,
            dateTimePreferences,
        ],
    )

    const selectedTicketIds = useMemo(() => {
        return new Set(
            Object.entries(rowSelection)
                .filter(([, selected]) => !!selected)
                .map(([rowId]) => displayedTickets[Number(rowId)]?.id)
                .filter((id): id is number => id !== undefined),
        )
    }, [displayedTickets, rowSelection])

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
    const isTrashLikeView = useIsTrashLikeView(viewId)
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

    if (placeholderKind === EmptyViewsState.Error) {
        return (
            <TicketListEmptyPlaceholder
                isLoading={false}
                emptyStateVariant={placeholderKind}
                isInboxView={isInboxView}
                onRefresh={refetch}
            />
        )
    }

    if (!viewResponse) {
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
                key={viewId}
                persistence={{
                    enable: true,
                    localStorage: { id: `ticket-table-${viewId}` },
                }}
                data={displayedTickets}
                columns={columns}
                isLoading={isLoading || isFetchingNextPage}
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
                    onChange: handleSortingChange,
                    persist: false,
                }}
                pagination={{
                    enable: true,
                    manual: true,
                    value: { pageIndex: currentPageIndex, pageSize },
                    hasNextPage:
                        (currentPageIndex + 1) * pageSize < tickets.length ||
                        !!hasNextPage,
                    hasPreviousPage: currentPageIndex > 0,
                    onPageChange: handlePageChange,
                    onPageSizeChange: (size) => {
                        setPageSize(size)
                        setCurrentPageIndex(0)
                    },
                    persist: true,
                }}
                columnEditing={{
                    enable: true,
                    defaultVisibleColumns,
                    onVisibleColumnsChange: onColumnVisibilityChange,
                    persist: true,
                }}
                renderEmptyState={() => (
                    <TicketListEmptyPlaceholder
                        isLoading={false}
                        emptyStateVariant={
                            placeholderKind ?? EmptyViewsState.Empty
                        }
                        isInboxView={isInboxView}
                        onFixFilters={onFixFilters}
                        onRefresh={refetch}
                    />
                )}
            >
                <TicketTableBulkActions
                    viewId={viewId}
                    selectedCount={selectedTicketIds.size}
                    isDisabled={isBulkActionLoading}
                    isAssignUserOpen={isAssignUserOpen}
                    onAssignUserOpenChange={setIsAssignUserOpen}
                    isAddTagOpen={isAddTagOpen}
                    onAddTagOpenChange={setIsAddTagOpen}
                    onSetStatus={handleSetStatus}
                    onAssignUser={handleAssignUser}
                    onAssignTeam={handleAssignTeam}
                    onAddTag={handleAddTag}
                    onMarkAsUnread={handleMarkAsUnread}
                    onMarkAsRead={handleMarkAsRead}
                    onChangePriority={handleChangePriority}
                    onApplyMacro={handleApplyMacro}
                    onExportTickets={handleExportTickets}
                    onMoveToTrash={handleMoveToTrash}
                    onUndelete={handleUndeleteFromTrashView}
                    onDeleteForever={handleDeleteForever}
                />
                <DataTablePagination />
            </DataTable>
        </div>
    )
}
