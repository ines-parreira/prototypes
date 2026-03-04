import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketReopenedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-reopened'>
}
export function TicketThreadAuditLogTicketReopenedEvent({
    item,
}: TicketThreadAuditLogTicketReopenedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="inbox" />
            <Text size="sm">Status was changed to Open</Text>
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
