import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
