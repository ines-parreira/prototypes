import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketClosedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-closed'>
}

export function TicketThreadAuditLogTicketClosedEvent({
    item,
}: TicketThreadAuditLogTicketClosedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="circle-check" />
            <Text size="sm">Status was changed to Closed</Text>
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
