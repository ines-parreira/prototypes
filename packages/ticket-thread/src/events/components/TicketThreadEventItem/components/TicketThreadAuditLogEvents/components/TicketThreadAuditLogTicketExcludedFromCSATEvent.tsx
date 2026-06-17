import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketExcludedFromCSATEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-excluded-from-csat'>
}

export function TicketThreadAuditLogTicketExcludedFromCSATEvent({
    item,
}: TicketThreadAuditLogTicketExcludedFromCSATEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="star" />
            <Text size="sm">Ticket excluded from CSAT</Text>
            <TicketThreadAuditLogEventAttribution
                attribution={item.meta.attribution}
                authorId={event.user_id}
            />
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
