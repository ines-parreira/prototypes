import { useCallback } from 'react'

import { Link } from 'react-router-dom'

import { TicketCompact } from '@gorgias/helpdesk-types'

import { logEvent, SegmentEvent } from 'common/segment'

import TicketCard from './TicketCard'

import css from './TicketListItem.less'

function ticketPath(ticketId: number) {
    return `/app/ticket/${ticketId}`
}

type Props = {
    ticket: TicketCompact
    isHighlighted: boolean
    displayedDate: JSX.Element
    onModalOpen: (ticketId: number) => void
}

export function TicketListItem({
    ticket,
    isHighlighted,
    displayedDate,
    onModalOpen,
}: Props) {
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLAnchorElement>) => {
            logEvent(SegmentEvent.CustomerTimelineTicketClicked)
            if (!event.metaKey) {
                event.preventDefault()
                onModalOpen(ticket.id)
            }
        },
        [ticket.id, onModalOpen],
    )

    return (
        <li key={ticket.id}>
            <Link
                className={css.cardContainer}
                to={ticketPath(ticket.id)}
                onClick={handleClick}
            >
                <TicketCard
                    className={css.card}
                    ticket={ticket}
                    isHighlighted={isHighlighted}
                    displayedDate={displayedDate}
                />
            </Link>
        </li>
    )
}
