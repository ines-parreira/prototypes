import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../../types'
import { TicketThreadAuditLogEventAttribution } from '../../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../../TicketThreadEventDateTime'
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
