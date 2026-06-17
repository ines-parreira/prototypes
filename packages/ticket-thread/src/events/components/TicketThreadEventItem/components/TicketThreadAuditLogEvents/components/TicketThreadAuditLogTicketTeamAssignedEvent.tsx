import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import { TicketThreadEventTarget } from '#events/components/TicketThreadEventItem/components/TicketThreadEventTarget'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketTeamAssignedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-team-assigned'>
}
export function TicketThreadAuditLogTicketTeamAssignedEvent({
    item,
}: TicketThreadAuditLogTicketTeamAssignedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="users" />
            <Text size="sm">Ticket was assigned</Text>
            {event.data?.assignee_team_id && (
                <TicketThreadEventTarget
                    assignee_team_id={event.data.assignee_team_id}
                />
            )}
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
