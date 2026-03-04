import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketSnoozedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-snoozed'>
}
export function TicketThreadAuditLogTicketSnoozedEvent({
    item,
}: TicketThreadAuditLogTicketSnoozedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="alarm" />
            <Text size="sm">Status was changed to Snoozed</Text>
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
