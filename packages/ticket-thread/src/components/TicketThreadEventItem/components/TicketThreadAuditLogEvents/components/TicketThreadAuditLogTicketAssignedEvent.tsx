import { useMemo } from 'react'

import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { useListAllHumanAgents } from '../../../../../hooks/shared/useListAllHumanAgents'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketAssignedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-assigned'>
}

export function TicketThreadAuditLogTicketAssignedEvent({
    item,
}: TicketThreadAuditLogTicketAssignedEventProps) {
    const event = item.data

    const { data: agents } = useListAllHumanAgents()

    const assignedAgent = useMemo(
        () =>
            agents?.find((agent) => agent.id === event.data?.assignee_user_id),
        [agents, event.data?.assignee_user_id],
    )

    if (!assignedAgent) {
        return null
    }

    return (
        <TicketThreadEventContainer>
            <Icon name="user" />
            <Text size="sm">Ticket assigned to {assignedAgent?.name}</Text>
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
