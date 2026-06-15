import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketSlaPolicyAssignedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-sla-policy-assigned'>
}

export function TicketThreadAuditLogTicketSlaPolicyAssignedEvent({
    item,
}: TicketThreadAuditLogTicketSlaPolicyAssignedEventProps) {
    const event = item.data
    const slaPolicyUuid = event.data?.sla_policy_uuid
    const slaPolicyName = event.data?.sla_policy_name

    return (
        <TicketThreadEventContainer>
            <Icon name="settings" />
            <Text size="sm">
                {'SLA Policy "'}
                {slaPolicyUuid && slaPolicyName ? (
                    <a
                        href={`/app/settings/sla/${slaPolicyUuid}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {slaPolicyName}
                    </a>
                ) : (
                    slaPolicyName
                )}
                {'" assigned'}
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
