import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketMergedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-merged'>
}
export function TicketThreadAuditLogTicketMergedEvent({
    item,
}: TicketThreadAuditLogTicketMergedEventProps) {
    const event = item.data
    const isAutoMergeServiceEvent =
        item.meta.attribution === 'none' && event.user_id == null

    return (
        <TicketThreadEventContainer>
            <Icon name="arrow-merging" />
            <Text size="sm">Merged</Text>
            {isAutoMergeServiceEvent ? (
                <Text size="sm">by auto-merge service</Text>
            ) : (
                <TicketThreadAuditLogEventAttribution
                    attribution={item.meta.attribution}
                    authorId={event.user_id}
                />
            )}
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
