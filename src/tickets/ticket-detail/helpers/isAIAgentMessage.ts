import type { TicketMessage } from '@gorgias/api-types'

import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'

export function isAIAgentMessage(message: TicketMessage) {
    return (
        !!message.sender.email &&
        AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS.includes(message.sender.email)
    )
}
