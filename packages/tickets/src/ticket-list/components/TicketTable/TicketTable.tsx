import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePrevious } from '@repo/hooks'
import { useUserDateTimePreferences } from '@repo/preferences'
import { useHistory } from 'react-router-dom'

import {
    DataTable,
    DataTablePagination,
    DataTableToolbar,
} from '@gorgias/axiom'
import type { SortingState } from '@gorgias/axiom'
import { useGetView } from '@gorgias/helpdesk-queries'
import type { Language, TicketCompact } from '@gorgias/helpdesk-types'

import { useCurrentUserLanguagePreferences } from '../../../translations/hooks/useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../../../translations/hooks/useTicketsTranslatedProperties'
import { useMarkTicketAsRead } from '../../hooks/useMarkTicketAsRead'
import { useSortOrder } from '../../hooks/useSortOrder'
import { useTicketsList } from '../../hooks/useTicketsList'
import { useTicketTableColumnVisibility } from '../../hooks/useTicketTableColumnVisibility'
import type { EmptyStateVariant } from '../TicketListEmptyPlaceholder'
import { TicketListEmptyPlaceholder } from '../TicketListEmptyPlaceholder'
import {
    parseSortOrder,
    SORT_FIELDS,
} from '../TicketListHeader/SortOrderDropdown'
import { createTicketTableColumns } from './TicketTableColumns'

import css from './TicketTable.module.less'

type Props = {
    viewId: number
    currentUserId?: number
    onFixFilters?: () => void
}

export function TicketTable({ viewId, currentUserId, onFixFilters }: Props) {
    const history = useHistory()
    const [sortOrder, setSortOrder] = useSortOrder(viewId)

    const { data: viewResponse } = useGetView(viewId)
    const view = viewResponse?.data
    const emptyStateVariant: EmptyStateVariant = view?.deactivated_datetime
        ? 'invalidFilters'
        : view === null
          ? 'inaccessible'
          : 'default'

    const [pageSize, setPageSize] = useState(20)

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
    } = useTicketsList(
        viewId,
        ticketsListParams,
        false,
        emptyStateVariant !== 'invalidFilters',
    )

    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const dateTimePreferences = useUserDateTimePreferences()

    const { markAsRead } = useMarkTicketAsRead()

    const [currentPageIndex, setCurrentPageIndex] = useState(0)

    const previousSortOrder = usePrevious(sortOrder)
    useEffect(() => {
        if (!previousSortOrder || previousSortOrder === sortOrder) return
        setCurrentPageIndex(0)
    }, [sortOrder, previousSortOrder])

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
    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: displayedTickets.map((ticket) => ticket.id),
    })

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

    if (error && emptyStateVariant === 'default') {
        return (
            <TicketListEmptyPlaceholder
                isLoading={false}
                emptyStateVariant="error"
                onRefresh={refetch}
            />
        )
    }

    return (
        <div className={css.container}>
            <DataTable
                key={sortOrder}
                data={displayedTickets}
                columns={columns}
                isLoading={isLoading || isFetchingNextPage}
                onRowClick={handleRowClick}
                layout="fixed"
                sorting={{
                    enable: true,
                    manual: true,
                    initial: sortingInitial,
                    onChange: handleSortingChange,
                }}
                pagination={{
                    enable: true,
                    manual: true,
                    pageSize,
                    hasNextPage:
                        (currentPageIndex + 1) * pageSize < tickets.length ||
                        !!hasNextPage,
                    hasPreviousPage: currentPageIndex > 0,
                    onPageChange: handlePageChange,
                    onPageSizeChange: (size) => {
                        setPageSize(size)
                        setCurrentPageIndex(0)
                    },
                }}
                columnEditing={{
                    enable: true,
                    defaultVisibleColumns,
                    onVisibleColumnsChange: onColumnVisibilityChange,
                }}
                renderEmptyState={() => (
                    <TicketListEmptyPlaceholder
                        isLoading={false}
                        emptyStateVariant={emptyStateVariant}
                        onFixFilters={onFixFilters}
                    />
                )}
            >
                <DataTableToolbar />
                <DataTablePagination />
            </DataTable>
        </div>
    )
}
