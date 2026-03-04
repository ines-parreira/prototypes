import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
