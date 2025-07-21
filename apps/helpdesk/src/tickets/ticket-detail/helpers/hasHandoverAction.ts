import type { TicketMessage } from '@gorgias/helpdesk-types'

import { MacroActionName } from 'models/macroAction/types'

export function hasHandoverAction(msg: TicketMessage) {
    return !!(
        msg.actions?.find((action) => action.name === MacroActionName.AddTags)
            ?.arguments as { tags: string | null }
    )?.tags
        ?.split(',')
        .map((t) => t.trim())
        .some((t) => t === 'ai_handover')
}
