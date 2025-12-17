import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { Ticket } from '@gorgias/helpdesk-types'

import TicketSummarySection from 'pages/tickets/detail/components/TicketSummary'

import css from './TicketSummary.less'

type Props = {
    summary: Ticket['summary']
    ticketId: number
}

export function TicketSummary({ summary, ticketId }: Props) {
    const enableAITicketSummary = useFlag(FeatureFlagKey.AITicketSummary)
    if (!enableAITicketSummary) return null

    return (
        <div className={css.container}>
            <TicketSummarySection summary={summary} ticketId={ticketId} />
        </div>
    )
}
