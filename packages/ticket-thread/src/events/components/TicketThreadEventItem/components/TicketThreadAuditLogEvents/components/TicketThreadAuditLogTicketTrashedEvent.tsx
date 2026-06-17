import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketTrashedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-trashed'>
}
export function TicketThreadAuditLogTicketTrashedEvent({
    item,
}: TicketThreadAuditLogTicketTrashedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="trash-empty" />
            <Text size="sm">Moved to trash</Text>
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
