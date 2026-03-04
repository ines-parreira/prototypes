import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'
import { TicketThreadEventTarget } from '../../TicketThreadEventTarget'

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
