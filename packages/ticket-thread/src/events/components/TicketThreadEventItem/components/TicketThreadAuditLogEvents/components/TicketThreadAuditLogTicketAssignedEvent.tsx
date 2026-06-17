import { useMemo } from 'react'

import { useAllUsers } from '@repo/users'

import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketAssignedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-assigned'>
}

export function TicketThreadAuditLogTicketAssignedEvent({
    item,
}: TicketThreadAuditLogTicketAssignedEventProps) {
    const event = item.data

    const agents = useAllUsers()

    const assignedAgent = useMemo(
        () => agents.find((agent) => agent.id === event.data?.assignee_user_id),
        [agents, event.data?.assignee_user_id],
    )

    return (
        <TicketThreadEventContainer>
            <Icon name="user" />
            <Text size="sm">
                {assignedAgent
                    ? `Ticket assigned to ${assignedAgent.name}`
                    : 'Ticket assigned'}
            </Text>
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
