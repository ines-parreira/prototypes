import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketTrashedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-trashed'>
}
export function TicketThreadAuditLogTicketTrashedEvent({
    item,
}: TicketThreadAuditLogTicketTrashedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="trash-empty" />
            <Text size="sm">Moved to trash</Text>
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
