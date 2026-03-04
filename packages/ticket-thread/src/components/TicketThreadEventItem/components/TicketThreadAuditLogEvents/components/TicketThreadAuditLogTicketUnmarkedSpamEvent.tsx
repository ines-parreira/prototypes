import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketUnmarkedSpamEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-unmarked-spam'>
}
export function TicketThreadAuditLogTicketUnmarkedSpamEvent({
    item,
}: TicketThreadAuditLogTicketUnmarkedSpamEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="arrow-undo-up-left" />
            <Text size="sm">Unmarked as spam</Text>
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
