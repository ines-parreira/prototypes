import { Link } from 'react-router-dom'

import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
