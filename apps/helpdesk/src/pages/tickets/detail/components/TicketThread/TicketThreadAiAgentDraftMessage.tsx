import type { TicketThreadAiAgentDraftMessageParams } from '@repo/ticket-thread/legacy-bridge'

import type { TicketMessage } from 'models/ticket/types'
import { AiAgentDraftMessageHelpdeskV2 } from 'pages/tickets/detail/components/TicketMessages/AIAgentDraftMessageHelpdeskV2/AiAgentDraftMessageHelpdeskV2'

export function TicketThreadAiAgentDraftMessage({
    message,
}: TicketThreadAiAgentDraftMessageParams) {
    const ticketId = message.ticket_id
    const legacyMessage = message as unknown as TicketMessage

    if (!ticketId) {
        return null
    }

    return (
        <AiAgentDraftMessageHelpdeskV2
            ticketId={ticketId}
            message={legacyMessage}
        />
    )
}
