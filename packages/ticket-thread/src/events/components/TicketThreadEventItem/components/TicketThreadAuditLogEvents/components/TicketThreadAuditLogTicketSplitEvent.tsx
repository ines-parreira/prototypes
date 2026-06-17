import { Link } from 'react-router-dom'

import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketSplitEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-split'>
}
export function TicketThreadAuditLogTicketSplitEvent({
    item,
}: TicketThreadAuditLogTicketSplitEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="arrow-routing" />
            <Text size="sm">
                Created from{' '}
                <Link to={`/app/ticket/${event.data?.split_into_ticket?.id}`}>
                    ticket
                </Link>
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
