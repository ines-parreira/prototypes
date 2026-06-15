import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../../types'
import { TicketThreadAuditLogEventAttribution } from '../../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../../TicketThreadEventDateTime'
import { TicketThreadAuditLogTagItem } from './TicketThreadAuditLogTagItem'

type TicketThreadAuditLogTagsAddedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-tags-added'>
}

export function TicketThreadAuditLogTagsAddedEvent({
    item,
}: TicketThreadAuditLogTagsAddedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="tag" />
            {event.data?.tags_added?.map((tag) => (
                <TicketThreadAuditLogTagItem key={tag} id={tag} />
            ))}
            <Text size="sm">
                {event.data?.tags_added?.length &&
                event.data?.tags_added?.length > 1
                    ? 'were'
                    : 'was'}{' '}
                added
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
