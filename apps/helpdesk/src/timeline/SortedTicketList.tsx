import { RefObject, useMemo } from 'react'

import DisplayedDate from './DisplayedDate'
import * as timelineItem from './helpers/timelineItem'
import { OrderCard } from './order-ticket'
import { TicketModal, useTicketModal } from './ticket-modal'
import { useModalShortcuts } from './ticket-modal/hooks/useModalShortcuts'
import { TicketListItem } from './TicketListItem'
import { SortOption, TimelineItem, TimelineItemKind } from './types'

import css from './SortedTicketList.less'

type Props = {
    ticketId: number
    sortedItems: TimelineItem[]
    sortOption: SortOption
    containerRef?: RefObject<HTMLDivElement>
}

export function SortedTicketList({
    ticketId,
    sortedItems,
    sortOption,
    containerRef,
}: Props) {
    const itemIds = useMemo(
        () => sortedItems.map((item) => timelineItem.getItemId(item)),
        [sortedItems],
    )

    const modal = useTicketModal(itemIds)
    useModalShortcuts(modal)

    const selectedTicket = modal.ticketId
        ? sortedItems
              .filter(timelineItem.isTicket)
              .find((item) => item.ticket.id === modal.ticketId)
        : undefined

    return (
        <>
            <ol className={css.list}>
                {sortedItems.map((item) => {
                    switch (item.kind) {
                        case TimelineItemKind.Order: {
                            return (
                                <li key={item.order.id}>
                                    <OrderCard
                                        className={css.card}
                                        order={item.order}
                                        displayedDate={DisplayedDate(
                                            sortOption,
                                            item,
                                        )}
                                    />
                                </li>
                            )
                        }
                        case TimelineItemKind.Ticket: {
                            if (!item.ticket.channel) {
                                return null
                            }

                            return (
                                <TicketListItem
                                    key={item.ticket.id}
                                    ticket={item.ticket}
                                    isHighlighted={ticketId === item.ticket.id}
                                    displayedDate={DisplayedDate(
                                        sortOption,
                                        item,
                                    )}
                                    onModalOpen={modal.onOpen}
                                />
                            )
                        }
                        default: {
                            return null
                        }
                    }
                })}
            </ol>
            {!!modal.ticketId && (
                <TicketModal
                    summary={selectedTicket?.ticket}
                    {...modal}
                    containerRef={containerRef}
                />
            )}
        </>
    )
}
