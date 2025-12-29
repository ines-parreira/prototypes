import { TicketListItem } from './TicketListItem'
import type { EnrichedTicket } from './types'

import css from './TicketTimelineWidget.less'

type TicketsListProps = {
    enrichedTickets: EnrichedTicket[]
}

export function TicketsList({ enrichedTickets }: TicketsListProps) {
    return (
        <ul className={css.timelineList}>
            {enrichedTickets.map((enrichedTicket) => (
                <TicketListItem
                    key={enrichedTicket.ticket.id}
                    ticket={enrichedTicket.ticket}
                    iconName={enrichedTicket.iconName}
                    customFields={enrichedTicket.customFields}
                    conditionsLoading={enrichedTicket.conditionsLoading}
                />
            ))}
        </ul>
    )
}
