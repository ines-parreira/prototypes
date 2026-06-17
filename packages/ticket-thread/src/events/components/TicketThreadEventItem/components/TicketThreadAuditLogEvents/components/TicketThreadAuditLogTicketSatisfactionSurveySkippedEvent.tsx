import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketSatisfactionSurveySkippedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-satisfaction-survey-skipped'>
}

export function TicketThreadAuditLogTicketSatisfactionSurveySkippedEvent({
    item,
}: TicketThreadAuditLogTicketSatisfactionSurveySkippedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="star" />
            <Text size="sm">Ticket not eligible for CSAT</Text>
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
