import { Box } from '@gorgias/axiom'

import type {
    TicketThreadEventItem,
    TicketThreadGroupedEventsItem,
    TicketThreadSingleEventItem,
} from '../../hooks/events/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { assertNever } from '../../utils/assertNever'
import { TicketThreadAuditLogEventItem } from './components/TicketThreadAuditLogEvents/TicketThreadAuditLogEventItem'

type TicketThreadSingleEventItemProps = {
    item: Exclude<TicketThreadEventItem, TicketThreadGroupedEventsItem>
}

export function TicketThreadSingleEventItem({
    item,
}: TicketThreadSingleEventItemProps) {
    switch (item._tag) {
        case TicketThreadItemTag.Events.TicketEvent:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        case TicketThreadItemTag.Events.PhoneEvent:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        case TicketThreadItemTag.Events.AuditLogEvent:
            return <TicketThreadAuditLogEventItem item={item} />
        case TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        case TicketThreadItemTag.Events.PrivateReplyEvent:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        case TicketThreadItemTag.Events.ShoppingAssistantEvent:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        default:
            return assertNever(item)
    }
}
