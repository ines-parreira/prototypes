import { useEffect, useMemo, useRef } from 'react'

import { formatTicketTime, TicketListItem } from '@repo/tickets'
import type { EnrichedTicket } from '@repo/tickets'

import { Box, Skeleton, Text } from '@gorgias/axiom'

import type { Order, Product } from 'constants/integrations/types/shopify'
import type { TimelineItem } from 'timeline/types'
import { TimelineItemKind } from 'timeline/types'

import { TimelineOrderCard } from './TimelineOrderCard'

import css from './TimelineList.less'

type Props = {
    timelineItems: TimelineItem[]
    enrichedTickets: EnrichedTicket[]
    isLoading: boolean
    totalNumber: number
    productsMap: Map<number, Product>
    activeTicketId?: string
    onSelectTicket: (ticket: EnrichedTicket) => void
    onSelectOrder: (order: Order) => void
    hasNextPage?: boolean
    fetchNextPage?: () => void
    isFetchingNextPage?: boolean
}

export function TimelineList({
    timelineItems,
    enrichedTickets,
    isLoading,
    totalNumber,
    productsMap,
    activeTicketId,
    onSelectTicket,
    onSelectOrder,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
}: Props) {
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // Create a map for fast lookup of enriched ticket data
    const enrichedTicketMap = useMemo(() => {
        const map = new Map<number, EnrichedTicket>()
        enrichedTickets.forEach((enriched) => {
            map.set(enriched.ticket.id, enriched)
        })
        return map
    }, [enrichedTickets])

    // Set up intersection observer for infinite scrolling
    useEffect(() => {
        if (!loadMoreRef.current || !hasNextPage || !fetchNextPage) {
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (
                    entry.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 },
        )

        observer.observe(loadMoreRef.current)

        return () => {
            observer.disconnect()
        }
    }, [hasNextPage, fetchNextPage, isFetchingNextPage])
    if (isLoading) {
        return (
            <Box flexDirection="column" gap="md" padding={'md'}>
                <Skeleton count={5} />
            </Box>
        )
    }

    if (totalNumber === 0) {
        return (
            <Box
                alignItems="center"
                justifyContent="center"
                paddingBottom={'xxxl'}
                paddingLeft={'md'}
                paddingRight={'md'}
            >
                <Text size="md" variant="regular" align="center">
                    No tickets for this customer
                </Text>
            </Box>
        )
    }

    if (timelineItems.length === 0) {
        return (
            <Box justifyContent="center" padding={'xl'}>
                <Text size="md" variant="regular">
                    No items match the selected filters
                </Text>
            </Box>
        )
    }

    return (
        <Box
            paddingLeft="md"
            paddingRight="md"
            paddingBottom="md"
            flexDirection="column"
        >
            <ol className={css.timelineList}>
                {timelineItems.map((item) => {
                    switch (item.kind) {
                        case TimelineItemKind.Order: {
                            return (
                                <li key={`order-${item.order.id}`}>
                                    <TimelineOrderCard
                                        order={item.order}
                                        displayedDate={formatTicketTime(
                                            item.order.created_at,
                                        )}
                                        productsMap={productsMap}
                                        onSelect={onSelectOrder}
                                    />
                                </li>
                            )
                        }
                        case TimelineItemKind.Ticket: {
                            if (!item.ticket.channel) {
                                return null
                            }

                            const enriched = enrichedTicketMap.get(
                                item.ticket.id,
                            )
                            if (!enriched) {
                                return null
                            }

                            const isActive =
                                !!activeTicketId &&
                                String(item.ticket.id) ===
                                    String(activeTicketId)

                            return (
                                <li key={`ticket-${item.ticket.id}`}>
                                    <TicketListItem
                                        ticket={enriched.ticket}
                                        iconName={enriched.iconName}
                                        customFields={enriched.customFields}
                                        conditionsLoading={
                                            enriched.conditionsLoading
                                        }
                                        className={
                                            isActive
                                                ? css.activeTicket
                                                : undefined
                                        }
                                        onSelect={() =>
                                            onSelectTicket(enriched)
                                        }
                                    />
                                </li>
                            )
                        }
                        default: {
                            return null
                        }
                    }
                })}
            </ol>
            {hasNextPage && (
                <Box
                    ref={loadMoreRef}
                    paddingTop="md"
                    paddingBottom="md"
                    flexDirection="column"
                    gap="md"
                >
                    {isFetchingNextPage &&
                        Array.from({ length: 10 }).map((_, index) => (
                            <Skeleton key={index} count={3} />
                        ))}
                </Box>
            )}
        </Box>
    )
}
