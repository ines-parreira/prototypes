import { Icon, Text } from '@gorgias/axiom'

import { SYSTEM_RULE_TYPE } from '../../../../../constants'
import type { TicketThreadAuditLogEventByType } from '../../../../../types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketMessageSummaryCreatedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-message-summary-created'>
}

export function TicketThreadAuditLogTicketMessageSummaryCreatedEvent({
    item,
}: TicketThreadAuditLogTicketMessageSummaryCreatedEventProps) {
    const event = item.data

    if (event.data?.type === SYSTEM_RULE_TYPE) {
        return null
    }

    const isTicketSummary = !event.data?.first_unseen_id

    if (isTicketSummary) {
        return (
            <TicketThreadEventContainer>
                <Icon name="ai-ticket-summary" />
                <Text size="sm">Ticket summary was generated</Text>
                <TicketThreadAuditLogEventAttribution
                    attribution={item.meta.attribution}
                    authorId={event.user_id}
                />
                {event.created_datetime && (
                    <TicketThreadEventDateTime
                        datetime={event.created_datetime}
                    />
                )}
            </TicketThreadEventContainer>
        )
    }

    return (
        <TicketThreadEventContainer>
            <Icon name="mail" />
            <Text size="sm">
                Chat summarized - Unseen chat messages were sent by email
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
