import { RefObject, useMemo } from 'react'

import { FeatureFlagKey } from '../config/featureFlags'
import { useFlag } from '../core/flags'
import DisplayedDate from './DisplayedDate'
import * as timelineItem from './helpers/timelineItem'
import { OrderTicketCard } from './order-ticket'
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

    const enableShopifyOrderInTimeline = useFlag(
        FeatureFlagKey.ShopifyCustomerTimeline,
        false,
    )

    return (
        <>
            <ol className={css.list}>
                {sortedItems.map((item) => {
                    switch (item.kind) {
                        case TimelineItemKind.Order: {
                            if (enableShopifyOrderInTimeline) {
                                return (
                                    <li key={item.order.id}>
                                        <OrderTicketCard
                                            className={css.card}
                                            order={item.order}
                                        />
                                    </li>
                                )
                            }
                            return null
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
                                        item.ticket,
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
