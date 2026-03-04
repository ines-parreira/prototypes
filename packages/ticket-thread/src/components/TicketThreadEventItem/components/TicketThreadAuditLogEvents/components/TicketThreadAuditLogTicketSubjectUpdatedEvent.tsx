import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketSubjectUpdatedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-subject-updated'>
}

export function TicketThreadAuditLogTicketSubjectUpdatedEvent({
    item,
}: TicketThreadAuditLogTicketSubjectUpdatedEventProps) {
    const event = item.data

    const oldSubject = event.data?.old_subject
    const newSubject = event.data?.new_subject

    return (
        <TicketThreadEventContainer>
            <Icon name="edit-pencil" />
            <Text size="sm">
                Subject updated{' '}
                {oldSubject && (
                    <Text size="sm">
                        from{' '}
                        <Text size="sm" variant="medium">
                            {oldSubject}
                        </Text>
                    </Text>
                )}
                {newSubject && (
                    <Text size="sm">
                        to{' '}
                        <Text size="sm" variant="medium">
                            {newSubject}
                        </Text>
                    </Text>
                )}
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
