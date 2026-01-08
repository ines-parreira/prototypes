import type { ReactNode } from 'react'

import css from './InfobarTicketDetailsHeader.less'

type InfobarTicketDetailsHeaderProps = {
    ticketSummaryIcon: ReactNode
}

export function InfobarTicketDetailsHeader({
    ticketSummaryIcon,
}: InfobarTicketDetailsHeaderProps) {
    return (
        <header className={css.header}>
            <div className={css.title}>
                <h2>Ticket details</h2>
            </div>
            {ticketSummaryIcon}
        </header>
    )
}
