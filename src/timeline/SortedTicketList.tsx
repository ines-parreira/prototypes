import { useMemo } from 'react'

import { TicketCompact } from '@gorgias/helpdesk-types'

import DisplayedDate from './DisplayedDate'
import { TicketModal, useTicketModal } from './ticket-modal'
import { useModalShortcuts } from './ticket-modal/hooks/useModalShortcuts'
import { TicketListItem } from './TicketListItem'
import { SortOption } from './types'

import css from './SortedTicketList.less'

type Props = {
    ticketId: number
    sortedTickets: TicketCompact[]
    sortOption: SortOption
    containerRef?: React.RefObject<HTMLDivElement>
}

export function SortedTicketList({
    ticketId,
    sortedTickets,
    sortOption,
    containerRef,
}: Props) {
    const ticketIds = useMemo(
        () => sortedTickets.map((ticket) => ticket.id),
        [sortedTickets],
    )

    const modal = useTicketModal(ticketIds)
    useModalShortcuts(modal)

    const selectedTicket = modal.ticketId
        ? sortedTickets.find((ticket) => ticket.id === modal.ticketId)
        : undefined

    return (
        <>
            <ol className={css.list}>
                {sortedTickets
                    .filter((ticket) => ticket.channel)
                    .map((ticket) => {
                        return (
                            <TicketListItem
                                key={ticket.id}
                                ticket={ticket}
                                isHighlighted={ticketId === ticket.id}
                                displayedDate={DisplayedDate(
                                    sortOption,
                                    ticket,
                                )}
                                onModalOpen={modal.onOpen}
                            />
                        )
                    })}
            </ol>
            {!!modal.ticketId && (
                <TicketModal
                    summary={selectedTicket}
                    {...modal}
                    containerRef={containerRef}
                />
            )}
        </>
    )
}
