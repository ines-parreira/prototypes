import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketTeamUnassignedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-team-unassigned'>
}

export function TicketThreadAuditLogTicketTeamUnassignedEvent({
    item,
}: TicketThreadAuditLogTicketTeamUnassignedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="user-close" />
            <Text size="sm">Unassigned from team</Text>
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
