import { useMemo } from 'react'

import { Box } from '@gorgias/axiom'

import type { TicketThreadEventItem } from '../../hooks/events/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { assertNever } from '../../utils/assertNever'

type TicketThreadEventItemProps = {
    item: TicketThreadEventItem
}

export function TicketThreadEventItem({ item }: TicketThreadEventItemProps) {
    const content = useMemo(() => {
        switch (item._tag) {
            case TicketThreadItemTag.Events.TicketEvent:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Events.PhoneEvent:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Events.AuditLogEvent:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Events.PrivateReplyEvent:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Events.ShoppingAssistantEvent:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            default:
                return assertNever(item)
        }
    }, [item])

    return <Box alignSelf="flex-end">{content}</Box>
}
