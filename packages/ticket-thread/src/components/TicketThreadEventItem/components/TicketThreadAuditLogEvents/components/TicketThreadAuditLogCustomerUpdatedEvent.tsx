import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogCustomerUpdatedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-customer-updated'>
}
export function TicketThreadAuditLogCustomerUpdatedEvent({
    item,
}: TicketThreadAuditLogCustomerUpdatedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="user" />
            <Text size="sm">Customer updated</Text>
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
