import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketExcludedFromAutoMergeEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-excluded-from-auto-merge'>
}

export function TicketThreadAuditLogTicketExcludedFromAutoMergeEvent({
    item,
}: TicketThreadAuditLogTicketExcludedFromAutoMergeEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="close" />
            <Text size="sm">Excluded from Auto-Merge</Text>
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
