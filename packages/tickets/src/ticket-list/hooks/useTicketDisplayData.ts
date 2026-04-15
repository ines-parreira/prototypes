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

export function getTicketCustomerName(ticket: TicketCompact) {
    if (!ticket.customer) return ''

    return (
        ticket.customer.name ||
        ticket.customer.email ||
        `Customer #${ticket.customer.id}`
    )
}

export function getTicketDisplaySubject({
    ticket,
    showTranslatedContent,
    translation,
}: Pick<Params, 'ticket' | 'showTranslatedContent' | 'translation'>) {
    const subject =
        showTranslatedContent && translation?.subject
            ? translation.subject
            : ticket.subject

    return subject?.trim() ? subject : 'No subject'
}

export function getTicketDisplayExcerpt({
    ticket,
    showTranslatedContent,
    translation,
}: Pick<Params, 'ticket' | 'showTranslatedContent' | 'translation'>) {
    if (showTranslatedContent && translation?.excerpt) {
        return translation.excerpt
    }

    return ticket.excerpt || ''
}

export function useTicketOtherAgentsViewing(
    ticketId: TicketCompact['id'],
    currentUserId?: number,
) {
    const { getTicketActivity } = useAgentActivityHook()
    const activity = ticketId ? getTicketActivity(ticketId) : { viewing: [] }

    return useMemo(
        () =>
            activity.viewing.filter(
                (agent: Agent) => agent.id !== currentUserId,
            ),
        [activity.viewing, currentUserId],
    )
}

export function useTicketDisplayData({
    ticket,
    currentUserId,
    showTranslatedContent,
    translation,
}: Params) {
    const otherAgentsViewing = useTicketOtherAgentsViewing(
        ticket.id,
        currentUserId,
    )

    const customerName = useMemo(() => getTicketCustomerName(ticket), [ticket])

    const displaySubject = useMemo(
        () =>
            getTicketDisplaySubject({
                ticket,
                showTranslatedContent,
                translation,
            }),
        [showTranslatedContent, ticket, translation],
    )

    const displayExcerpt = useMemo(
        () =>
            getTicketDisplayExcerpt({
                ticket,
                showTranslatedContent,
                translation,
            }),
        [showTranslatedContent, ticket, translation],
    )

    return {
        otherAgentsViewing,
        customerName,
        displaySubject,
        displayExcerpt,
    }
}
