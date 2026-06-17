import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'
import { TicketThreadAuditLogTagItem } from './TicketThreadAuditLogTagItem'

type TicketThreadAuditLogTagsRemovedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-tags-removed'>
}

export function TicketThreadAuditLogTagsRemovedEvent({
    item,
}: TicketThreadAuditLogTagsRemovedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="close-circle" />
            {event.data?.tags_removed?.map((tag) => (
                <TicketThreadAuditLogTagItem key={tag} id={tag} />
            ))}
            <Text size="sm">
                {event.data?.tags_removed?.length &&
                event.data?.tags_removed?.length > 1
                    ? 'were'
                    : 'was'}{' '}
                removed
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
