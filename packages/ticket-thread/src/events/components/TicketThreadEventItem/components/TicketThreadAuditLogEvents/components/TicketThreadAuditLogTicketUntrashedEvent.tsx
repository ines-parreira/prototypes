import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketUntrashedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-untrashed'>
}
export function TicketThreadAuditLogTicketUntrashedEvent({
    item,
}: TicketThreadAuditLogTicketUntrashedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="arrow-undo-up-left" />
            <Text size="sm">Restored from trash</Text>
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
