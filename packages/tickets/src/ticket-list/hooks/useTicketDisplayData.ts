import { useMemo } from 'react'

import type {
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'
import type { useAgentActivity } from '@gorgias/realtime'
import { useAgentActivity as useAgentActivityHook } from '@gorgias/realtime'

type AgentActivity = ReturnType<
    ReturnType<typeof useAgentActivity>['getTicketActivity']
>
export type Agent = AgentActivity['viewing'][number]

type Params = {
    ticket: TicketCompact
    currentUserId?: number
    showTranslatedContent?: boolean
    translation?: TicketTranslationCompact
}

export function useTicketDisplayData({
    ticket,
    currentUserId,
    showTranslatedContent,
    translation,
}: Params) {
    const { getTicketActivity } = useAgentActivityHook()
    const activity = ticket.id ? getTicketActivity(ticket.id) : { viewing: [] }

    const otherAgentsViewing = useMemo(
        () =>
            activity.viewing.filter(
                (agent: Agent) => agent.id !== currentUserId,
            ),
        [activity.viewing, currentUserId],
    )

    const customerName = useMemo(() => {
        if (!ticket.customer) return ''
        return (
            ticket.customer.name ||
            ticket.customer.email ||
            `Customer #${ticket.customer.id}`
        )
    }, [ticket.customer])

    const displaySubject = useMemo(() => {
        if (showTranslatedContent && translation?.subject)
            return translation.subject
        return ticket.subject
    }, [showTranslatedContent, translation?.subject, ticket.subject])

    const displayExcerpt = useMemo(() => {
        if (showTranslatedContent && translation?.excerpt)
            return translation.excerpt
        return ticket.excerpt || ''
    }, [showTranslatedContent, translation?.excerpt, ticket.excerpt])

    return { otherAgentsViewing, customerName, displaySubject, displayExcerpt }
}
