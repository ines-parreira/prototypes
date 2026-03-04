import { forwardRef, useCallback, useMemo } from 'react'

import { Virtuoso } from 'react-virtuoso'
import type { Components } from 'react-virtuoso'

import { Box, Text } from '@gorgias/axiom'
import type {
    Language,
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { useCurrentUserLanguagePreferences } from '../../translations/hooks/useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../../translations/hooks/useTicketsTranslatedProperties'
import { useSortOrder } from '../hooks/useSortOrder'
import { useTicketsList } from '../hooks/useTicketsList'
import { useViewVisibleTickets } from '../hooks/useViewVisibleTickets'
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
    selectedTicketIds?: Set<number>
    onSelectTicket?: (
        ticketId: number,
        selected: boolean,
        shiftKey?: boolean,
    ) => void
    hasSelectedAll?: boolean
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
    if (context?.isLoading) {
        return (
            <>
                {Array.from({ length: 10 }, (_, i) => (
                    <TicketListItemSkeleton key={i} />
                ))}
            </>
        )
    }
    return <Text color="content-neutral-secondary">No tickets found</Text>
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
                context.selectedTicketIds?.has(ticket.id) ||
                false
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
    activeTicketId?: number
    currentUserId?: number
    selectedTicketIds?: Set<number>
    onSelectTicket?: (
        ticketId: number,
        selected: boolean,
        shiftKey?: boolean,
    ) => void
    hasSelectedAll?: boolean
}

export function TicketList({
    viewId,
    activeTicketId,
    currentUserId,
    selectedTicketIds,
    onSelectTicket,
    hasSelectedAll,
}: Props) {
    const [sortOrder] = useSortOrder(viewId)
    const ticketsListParams = useMemo(
        () => ({ order_by: sortOrder }),
        [sortOrder],
    )
    const {
        tickets,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        error,
    } = useTicketsList(viewId, ticketsListParams)

    const { viewVisibleTickets } = useViewVisibleTickets()

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
            onSelectTicket,
            hasSelectedAll,
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
            onSelectTicket,
            hasSelectedAll,
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

    if (error) {
        return <div>Error loading tickets</div>
    }

    return (
        <Box
            height="100%"
            width="100%"
            flexDirection="column"
            padding="xs"
            className={css.ticketListContainer}
        >
            <Virtuoso<TicketCompact, ListContext>
                data={isLoading ? [] : tickets}
                context={context}
                increaseViewportBy={{ top: 300, bottom: 1000 }}
                components={virtuosoComponents}
                itemContent={itemContent}
                rangeChanged={handleRangeChanged}
                endReached={handleEndReached}
            />
        </Box>
    )
}
