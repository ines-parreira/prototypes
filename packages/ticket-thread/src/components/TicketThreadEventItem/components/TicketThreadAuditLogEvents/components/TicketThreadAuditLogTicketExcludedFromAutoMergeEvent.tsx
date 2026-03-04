import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
