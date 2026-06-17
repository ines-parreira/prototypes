import { Link } from 'react-router-dom'

import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogRuleSuggestionEventProps = {
    item: TicketThreadAuditLogEventByType<
        'rule-executed' | 'rule-suggestion-suggested'
    >
}

export function TicketThreadAuditLogRuleSuggestionEvent({
    item,
}: TicketThreadAuditLogRuleSuggestionEventProps) {
    const event = item.data

    const slug = event.data?.slug

    if (!slug) {
        return null
    }

    const isRuleSuggestionEvent = event.type === 'rule-suggestion-suggested'

    return (
        <TicketThreadEventContainer>
            <Icon name="light-bulb" />
            <Text size="sm">
                {isRuleSuggestionEvent
                    ? 'Gorgias Tip suggested rule "'
                    : 'Rule "'}
                <Link to={`/app/settings/rules/library?${slug}`}>{slug}</Link>
                {'" '}
                {isRuleSuggestionEvent
                    ? 'to ticket'
                    : 'applied to ticket manually'}
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
