import type { ReactNode } from 'react'

import { Icon } from '@gorgias/axiom'

import css from './InfobarTicketDetails.less'

type Props = {
    ticketSummaryIcon: ReactNode
}

export function InfobarTicketDetails({ ticketSummaryIcon }: Props) {
    return (
        <div className={css.container}>
            <header className={css.header}>
                <div className={css.title}>
                    <Icon name="comm-chat-conversation" size={20} />
                    <h2>Ticket details</h2>
                </div>
                {ticketSummaryIcon}
            </header>
        </div>
    )
}
