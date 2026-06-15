import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
