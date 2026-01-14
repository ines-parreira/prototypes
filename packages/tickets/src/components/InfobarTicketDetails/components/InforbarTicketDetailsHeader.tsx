import type { ReactNode } from 'react'

import { Heading } from '@gorgias/axiom'

import css from './InfobarTicketDetailsHeader.less'

type InfobarTicketDetailsHeaderProps = {
    ticketSummaryIcon: ReactNode
}

export function InfobarTicketDetailsHeader({
    ticketSummaryIcon,
}: InfobarTicketDetailsHeaderProps) {
    return (
        <header className={css.header}>
            <Heading size="sm">Ticket details</Heading>
            {ticketSummaryIcon}
        </header>
    )
}
