import type { TicketMessage } from '@gorgias/helpdesk-types'

import { MacroActionName } from 'models/macroAction/types'

export function hasSnoozeAction(msg: TicketMessage) {
    return !!msg.actions?.some(
        (action) => action.name === MacroActionName.SnoozeTicket,
    )
}
