import type { TicketMessage } from '@gorgias/helpdesk-types'

import { MessageMetadataType } from 'models/ticket/types'

export function isSignalMessage(msg: TicketMessage) {
    return (
        (msg.meta as Record<string, unknown> | undefined)?.type ===
        MessageMetadataType.Signal
    )
}
