import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketSelfUnsnoozedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-self-unsnoozed'>
}
export function TicketThreadAuditLogTicketSelfUnsnoozedEvent({
    item,
}: TicketThreadAuditLogTicketSelfUnsnoozedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="timer-snooze" />
            <Text size="sm">Snooze delay ended</Text>
            <TicketThreadAuditLogEventAttribution
                attribution={item.meta.attribution}
                authorId={event.user_id}
                allowAuthorFallback={false}
            />
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
