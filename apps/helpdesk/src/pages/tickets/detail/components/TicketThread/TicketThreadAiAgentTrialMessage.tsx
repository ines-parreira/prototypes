import type { TicketThreadAiAgentTrialMessageParams } from '@repo/ticket-thread/legacy-bridge'

import type { TicketMessage } from 'models/ticket/types'
import { AiAgentTrialMessageHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AIAgentTrialMessageHelpdeskV2/AiAgentTrialMessageHelpdeskV2'

export function TicketThreadAiAgentTrialMessage({
    message,
}: TicketThreadAiAgentTrialMessageParams) {
    const ticketId = message.ticket_id
    const legacyMessage = message as unknown as TicketMessage

    if (!ticketId) {
        return null
    }

    return (
        <AiAgentTrialMessageHelpdeskV2
            ticketId={ticketId}
            message={legacyMessage}
        />
    )
}
