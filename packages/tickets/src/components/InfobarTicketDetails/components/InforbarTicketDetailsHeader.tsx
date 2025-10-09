import type { ReactNode } from 'react'

import { Icon } from '@gorgias/axiom'

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
                <Icon name="comm-chat-conversation" size="md" />
                <h2>Ticket details</h2>
            </div>
            {ticketSummaryIcon}
        </header>
    )
}
