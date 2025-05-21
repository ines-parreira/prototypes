import type { TicketMessage } from '@gorgias/api-types'

import { MessageMetadataType } from 'models/ticket/types'

export function isSignalMessage(msg: TicketMessage) {
    return (
        (msg.meta as Record<string, unknown> | undefined)?.type ===
        MessageMetadataType.Signal
    )
}
