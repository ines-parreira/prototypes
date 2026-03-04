import { useMemo } from 'react'

import type { ColorValue } from '@gorgias/axiom'
import { Dot, Icon, Skeleton, Tag, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { useListAllTags } from '../../../../../hooks/shared/useListAllTags'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTagsRemovedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-tags-removed'>
}

export function TicketThreadAuditLogTagsRemovedEvent({
    item,
}: TicketThreadAuditLogTagsRemovedEventProps) {
    const event = item.data

    const { data: tags } = useListAllTags()

    const eventTags = useMemo(
        () =>
            event.data?.tags_removed
                ?.map((tag) => tags?.find((t) => t.id === tag))
                .filter(Boolean),
        [event.data?.tags_removed, tags],
    )

    if (!eventTags || eventTags.length === 0) {
        return <Skeleton height="16px" width="100px" />
    }

    return (
        <TicketThreadEventContainer>
            <Icon name="close-circle" />
            {eventTags.map((tag) => (
                <Tag
                    size="sm"
                    key={tag?.id}
                    {...(tag?.decoration?.color && {
                        leadingSlot: (
                            <Dot color={tag.decoration?.color as ColorValue} />
                        ),
                    })}
                >
                    {tag?.name}
                </Tag>
            ))}
            <Text size="sm">
                {eventTags.length > 1 ? 'were' : 'was'} removed
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
