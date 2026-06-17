import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

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
