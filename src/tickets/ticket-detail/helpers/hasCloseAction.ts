import type { TicketMessage } from '@gorgias/api-types'

import { TicketStatus } from 'business/types/ticket'
import { MacroActionName } from 'models/macroAction/types'

export function hasCloseAction(msg: TicketMessage) {
    return !!msg.actions?.some(
        (action) =>
            action.name === MacroActionName.SetStatus &&
            (action.arguments as { status: TicketStatus | null })?.status ===
                TicketStatus.Closed,
    )
}
