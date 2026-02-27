import { useCallback, useMemo } from 'react'

import { Virtuoso } from 'react-virtuoso'

import type {
    Language,
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'
import type { useAgentActivity } from '@gorgias/realtime-ably'
import { useAgentActivity as useAgentActivityHook } from '@gorgias/realtime-ably'

import { useCurrentUserLanguagePreferences } from '../../translations/hooks/useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../../translations/hooks/useTicketsTranslatedProperties'
import { useSortOrder } from '../hooks/useSortOrder'
import { useTicketsList } from '../hooks/useTicketsList'
import { useViewVisibleTickets } from '../hooks/useViewVisibleTickets'
import { TicketListItem } from './TicketListItem'

type AgentActivity = ReturnType<
    ReturnType<typeof useAgentActivity>['getTicketActivity']
>

type ListContext = {
    activeTicketId?: number
    currentUserId?: number
    translationMap: Record<number, TicketTranslationCompact>
    shouldShowTranslatedContent: (language?: Language | null) => boolean
    getTicketActivity: (ticketId: number) => AgentActivity
}

function itemContent(
    _index: number,
    ticket: TicketCompact,
    context: ListContext,
) {
    return (
        <TicketListItem
            ticket={ticket}
            isActive={ticket.id === context.activeTicketId}
            currentUserId={context.currentUserId}
            translation={context.translationMap[ticket.id]}
            showTranslatedContent={context.shouldShowTranslatedContent(
                ticket.language,
            )}
            agentActivity={
                ticket.id ? context.getTicketActivity(ticket.id) : undefined
            }
        />
    )
}

type Props = {
    viewId: number
    activeTicketId?: number
    currentUserId?: number
}

export function TicketList({ viewId, activeTicketId, currentUserId }: Props) {
    const [sortOrder] = useSortOrder(viewId)
    const ticketsListParams = useMemo(
        () => ({ order_by: sortOrder }),
        [sortOrder],
    )
    const { tickets, fetchNextPage, hasNextPage, isLoading, error } =
        useTicketsList(viewId, ticketsListParams)

    const { viewVisibleTickets } = useViewVisibleTickets()

    const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets])
    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: ticketIds,
    })
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const { getTicketActivity } = useAgentActivityHook()

    const context = useMemo<ListContext>(
        () => ({
            activeTicketId,
            currentUserId,
            translationMap,
            shouldShowTranslatedContent,
            getTicketActivity,
        }),
        [
            activeTicketId,
            currentUserId,
            translationMap,
            shouldShowTranslatedContent,
            getTicketActivity,
        ],
    )

    const handleRangeChanged = useCallback(
        (range: { startIndex: number; endIndex: number }) => {
            const visibleTickets = tickets.slice(
                range.startIndex,
                range.endIndex + 1,
            )
            viewVisibleTickets(visibleTickets)
        },
        [tickets, viewVisibleTickets],
    )

    const handleEndReached = useCallback(() => {
        if (hasNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, fetchNextPage])

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        console.error('TicketList error:', error)
        return <div>Error loading tickets</div>
    }

    if (tickets.length === 0) {
        return <div>No tickets found</div>
    }

    return (
        <Virtuoso<TicketCompact, ListContext>
            style={{ height: '100%' }}
            data={tickets}
            context={context}
            increaseViewportBy={{ top: 0, bottom: 1000 }}
            itemContent={itemContent}
            rangeChanged={handleRangeChanged}
            endReached={handleEndReached}
        />
    )
}
