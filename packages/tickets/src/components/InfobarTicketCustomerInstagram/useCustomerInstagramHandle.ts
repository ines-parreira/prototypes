import { useMemo } from 'react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

export const useCustomerInstagramHandle = (messages: TicketMessage[]) => {
    return useMemo(() => {
        if (messages.length === 0) {
            return null
        }

        const firstMessage = messages[0]
        return firstMessage?.sender?.name
    }, [messages])
}
