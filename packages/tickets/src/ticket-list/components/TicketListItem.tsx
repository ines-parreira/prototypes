import { memo, useMemo } from 'react'

import type {
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'
import type { useAgentActivity } from '@gorgias/realtime-ably'

type AgentActivity = ReturnType<
    ReturnType<typeof useAgentActivity>['getTicketActivity']
>
type Agent = AgentActivity['viewing'][number]

type Props = {
    ticket: TicketCompact
    isActive: boolean
    currentUserId?: number
    translation?: TicketTranslationCompact
    showTranslatedContent?: boolean
    agentActivity?: AgentActivity
}

export const TicketListItem = memo(function TicketListItem({
    ticket,
    isActive,
    currentUserId,
    translation,
    showTranslatedContent,
    agentActivity,
}: Props) {
    const otherAgentsViewing = useMemo(
        () =>
            (agentActivity?.viewing ?? []).filter(
                (agent: Agent) => agent.id !== currentUserId,
            ),
        [agentActivity?.viewing, currentUserId],
    )

    const subject =
        showTranslatedContent && translation?.subject
            ? translation.subject
            : ticket.subject

    return (
        <div
            style={{
                padding: '8px',
                background: isActive ? '#e0e0e0' : 'white',
            }}
        >
            <div>{subject}</div>
            {otherAgentsViewing.length > 0 && <div>another agent viewing</div>}
        </div>
    )
})
