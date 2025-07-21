import { useCallback } from 'react'

import { Link } from 'react-router-dom'

import { TicketCompact } from '@gorgias/helpdesk-types'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

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
    const hasTicketModal = useFlag(FeatureFlagKey.TimelineTicketModal)

    const card = (
        <TicketCard
            className={css.card}
            ticket={ticket}
            isHighlighted={isHighlighted}
            displayedDate={displayedDate}
        />
    )

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
            {hasTicketModal ? (
                <Link
                    className={css.cardContainer}
                    to={ticketPath(ticket.id)}
                    onClick={handleClick}
                >
                    {card}
                </Link>
            ) : (
                <Link
                    to={ticketPath(ticket.id)}
                    onClick={() => {
                        logEvent(SegmentEvent.CustomerTimelineTicketClicked)
                    }}
                >
                    {card}
                </Link>
            )}
        </li>
    )
}
