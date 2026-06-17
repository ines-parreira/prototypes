import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogSatisfactionSurveySentEventProps = {
    item: TicketThreadAuditLogEventByType<'satisfaction-survey-sent'>
}

export function TicketThreadAuditLogSatisfactionSurveySentEvent({
    item,
}: TicketThreadAuditLogSatisfactionSurveySentEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="star" />
            <Text size="sm">CSAT survey sent</Text>
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
