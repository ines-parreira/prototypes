import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
