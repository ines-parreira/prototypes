import type { Ticket } from '@gorgias/api-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import TicketSummarySection from 'pages/tickets/detail/components/TicketSummary'

type Props = {
    ticket: Ticket
}

export function TicketSummary({ ticket }: Props) {
    const enableAITicketSummary = useFlag(FeatureFlagKey.AITicketSummary)
    if (!enableAITicketSummary) return null

    return (
        <TicketSummarySection summary={ticket.summary} ticketId={ticket.id} />
    )
}
