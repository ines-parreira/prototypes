import type { Ticket } from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import TicketSummarySection from 'pages/tickets/detail/components/TicketSummary'

import css from './TicketSummary.less'

type Props = {
    ticket: Ticket
}

export function TicketSummary({ ticket }: Props) {
    const enableAITicketSummary = useFlag(FeatureFlagKey.AITicketSummary)
    if (!enableAITicketSummary) return null

    return (
        <div className={css.container}>
            <TicketSummarySection
                summary={ticket.summary}
                ticketId={ticket.id}
            />
        </div>
    )
}
