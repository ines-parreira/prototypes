import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'

import { usePrevious } from '@repo/hooks'
import { Virtuoso } from 'react-virtuoso'
import type { Components } from 'react-virtuoso'

import { Box } from '@gorgias/axiom'
import { useGetView } from '@gorgias/helpdesk-queries'
import type {
    Language,
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { useCurrentUserLanguagePreferences } from '../../translations/hooks/useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../../translations/hooks/useTicketsTranslatedProperties'
import { useMarkTicketAsRead } from '../hooks/useMarkTicketAsRead'
import { useSortOrder } from '../hooks/useSortOrder'
import type { OnSelectTicketParams } from '../hooks/useTicketSelection'
import { useTicketSelection } from '../hooks/useTicketSelection'
import { useTicketsList } from '../hooks/useTicketsList'
import { useViewVisibleTickets } from '../hooks/useViewVisibleTickets'
import { TicketListActions } from './TicketListActions/TicketListActions'
import type { EmptyStateVariant } from './TicketListEmptyPlaceholder'
import { TicketListEmptyPlaceholder } from './TicketListEmptyPlaceholder'
import { TicketListHeader } from './TicketListHeader/TicketListHeader'
import { TicketListItemSkeleton } from './TicketListItem/components/TicketListItemSkeleton'
import { TicketListItem } from './TicketListItem/TicketListItem'

import css from './TicketList.module.less'

type ListContext = {
    viewId: number
    activeTicketId?: number
    currentUserId?: number
    isLoading: boolean
    isFetchingNextPage: boolean
    translationMap: Record<number, TicketTranslationCompact>
    shouldShowTranslatedContent: (language?: Language | null) => boolean
    selectedTicketIds: Set<number>
    onSelectTicket: (params: OnSelectTicketParams) => void
    hasSelectedAll: boolean
    emptyStateVariant: EmptyStateVariant
    onFixFilters?: () => void
}

const List: NonNullable<Components<TicketCompact, ListContext>['List']> =
    forwardRef(({ children, context, ...props }, ref) => (
        <div
            role="feed"
            aria-label="Tickets"
            aria-busy={context?.isLoading}
            ref={ref}
            {...props}
        >
            {children}
        </div>
    ))

const Item: NonNullable<Components<TicketCompact, ListContext>['Item']> = ({
    children,
    context: __context,
    ...props
}) => (
    <div role="article" {...props}>
        {children}
    </div>
)

function EmptyPlaceholder({ context }: { context?: ListContext }) {
    const {
        isLoading = false,
        emptyStateVariant = 'default',
        onFixFilters,
    } = context ?? {}
    return (
        <TicketListEmptyPlaceholder
            isLoading={isLoading}
            emptyStateVariant={emptyStateVariant}
            onFixFilters={onFixFilters}
        />
    )
}

function Footer({ context }: { context?: ListContext }) {
    if (!context?.isFetchingNextPage) return null
    return (
        <>
            {Array.from({ length: 3 }, (_, i) => (
                <TicketListItemSkeleton key={i} />
            ))}
        </>
    )
}

const virtuosoComponents = {
    EmptyPlaceholder,
    Footer,
    List,
    Item,
} as unknown as Components<TicketCompact, ListContext>

function itemContent(
    _index: number,
    ticket: TicketCompact,
    context: ListContext,
) {
    return (
        <TicketListItem
            viewId={context.viewId}
            ticket={ticket}
            isActive={ticket.id === context.activeTicketId}
            currentUserId={context.currentUserId}
            isSelected={
                context.hasSelectedAll ||
                context.selectedTicketIds.has(ticket.id)
            }
            onSelect={context.onSelectTicket}
            translation={context.translationMap?.[ticket.id]}
            showTranslatedContent={context.shouldShowTranslatedContent(
                ticket.language,
            )}
        />
    )
}

type Props = {
    viewId: number
    onCollapse: () => void
    activeTicketId?: number
    currentUserId?: number
    onApplyMacro?: (ticketIds: number[]) => void
    onFixFilters?: () => void
}

export function TicketList({
    viewId,
    onCollapse,
    activeTicketId,
    currentUserId,
    onApplyMacro,
    onFixFilters,
}: Props) {
    const [sortOrder] = useSortOrder(viewId)

    const { data: viewResponse } = useGetView(viewId)
    const view = viewResponse?.data
    const emptyStateVariant: EmptyStateVariant = view?.deactivated_datetime
        ? 'invalidFilters'
        : view === null
          ? 'inaccessible'
          : 'default'

    const [pauseUpdates, setPauseUpdates] = useState(false)

    const ticketsListParams = useMemo(
        () => ({ order_by: sortOrder }),
        [sortOrder],
    )
    const shouldPollTicketUpdates = emptyStateVariant !== 'invalidFilters'

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
        pauseUpdates,
        shouldPollTicketUpdates,
    )

    const {
        hasSelectedAll,
        selectedTicketIds,
        selectionCount,
        hasAnySelection,
        onSelect,
        onSelectAll,
        clear,
    } = useTicketSelection(tickets)

    useEffect(() => {
        setPauseUpdates(hasAnySelection)
    }, [hasAnySelection])

    const previousSortOrder = usePrevious(sortOrder)
    useEffect(() => {
        if (!previousSortOrder || previousSortOrder === sortOrder) return
        clear()
    }, [sortOrder, previousSortOrder, clear])

    const { viewVisibleTickets } = useViewVisibleTickets()

    const { markAsRead } = useMarkTicketAsRead()
    const activeTicketInListId = useMemo(() => {
        if (!activeTicketId) return undefined
        return tickets.some((ticket) => ticket.id === activeTicketId)
            ? activeTicketId
            : undefined
    }, [activeTicketId, tickets])
    const previousActiveTicketInListId = usePrevious(activeTicketInListId)
    useEffect(() => {
        if (!activeTicketId) return

        const activeTicket = tickets.find((t) => t.id === activeTicketId)
        if (!activeTicket) return

        if (previousActiveTicketInListId === activeTicketId) return

        if (activeTicket.is_unread) {
            markAsRead(activeTicketId)
        }
    }, [activeTicketId, previousActiveTicketInListId, tickets, markAsRead])

    const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets])
    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: ticketIds,
    })
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()

    const context = useMemo<ListContext>(
        () => ({
            viewId,
            activeTicketId,
            currentUserId,
            isLoading,
            isFetchingNextPage,
            translationMap,
            shouldShowTranslatedContent,
            selectedTicketIds,
            onSelectTicket: onSelect,
            hasSelectedAll,
            emptyStateVariant,
            onFixFilters,
        }),
        [
            viewId,
            activeTicketId,
            currentUserId,
            isLoading,
            isFetchingNextPage,
            translationMap,
            shouldShowTranslatedContent,
            selectedTicketIds,
            onSelect,
            hasSelectedAll,
            emptyStateVariant,
            onFixFilters,
        ],
    )

    const handleRangeChanged = useCallback(
        (range: { startIndex: number; endIndex: number }) => {
            const visibleTickets = tickets.slice(
                range.startIndex,
                range.endIndex + 1,
            )
            viewVisibleTickets(visibleTickets)

            if (
                hasNextPage &&
                !isFetchingNextPage &&
                range.endIndex >= tickets.length - 8
            ) {
                fetchNextPage()
            }
        },
        [
            tickets,
            viewVisibleTickets,
            hasNextPage,
            isFetchingNextPage,
            fetchNextPage,
        ],
    )

    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    if (error && emptyStateVariant === 'default') {
        return (
            <TicketListEmptyPlaceholder
                isLoading={false}
                emptyStateVariant="error"
                onRefresh={refetch}
            />
        )
    }

    const showEmptyPlaceholder = !isLoading && tickets.length === 0

    return (
        <Box
            height="100%"
            width="100%"
            flexDirection="column"
            className={css.ticketListContainer}
        >
            <TicketListHeader
                viewId={viewId}
                onCollapse={onCollapse}
                onEditView={onFixFilters}
            />
            <TicketListActions
                viewId={viewId}
                selectedTicketIds={selectedTicketIds}
                visibleTicketIds={ticketIds}
                hasSelectedAll={hasSelectedAll}
                selectionCount={selectionCount}
                onSelectAll={onSelectAll}
                onActionComplete={clear}
                onApplyMacro={onApplyMacro}
            />
            {showEmptyPlaceholder ? (
                <TicketListEmptyPlaceholder
                    isLoading={false}
                    emptyStateVariant={emptyStateVariant}
                    onFixFilters={onFixFilters}
                />
            ) : (
                <Virtuoso<TicketCompact, ListContext>
                    className={css.ticketList}
                    data={isLoading ? [] : tickets}
                    context={context}
                    increaseViewportBy={{ top: 300, bottom: 1000 }}
                    components={virtuosoComponents}
                    itemContent={itemContent}
                    rangeChanged={handleRangeChanged}
                    endReached={handleEndReached}
                />
            )}
        </Box>
    )
}
