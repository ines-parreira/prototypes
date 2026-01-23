import { TicketListItem } from './TicketListItem'
import type { EnrichedTicket } from './types'

import css from './TicketTimelineWidget.less'

type TicketsListProps = {
    enrichedTickets: EnrichedTicket[]
    onSelectTicket?: (ticket: EnrichedTicket) => void
}

export function TicketsList({
    enrichedTickets,
    onSelectTicket,
}: TicketsListProps) {
    return (
        <ul className={css.timelineList}>
            {enrichedTickets.map((enrichedTicket) => (
                <TicketListItem
                    key={enrichedTicket.ticket.id}
                    ticket={enrichedTicket.ticket}
                    iconName={enrichedTicket.iconName}
                    customFields={enrichedTicket.customFields}
                    conditionsLoading={enrichedTicket.conditionsLoading}
                    onSelect={
                        onSelectTicket
                            ? () => onSelectTicket(enrichedTicket)
                            : undefined
                    }
                />
            ))}
        </ul>
    )
}
