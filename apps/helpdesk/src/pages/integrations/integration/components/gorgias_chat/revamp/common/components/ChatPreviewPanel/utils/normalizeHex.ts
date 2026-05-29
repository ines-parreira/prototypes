import { toHex } from 'color2k'

import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'

export const normalizeHex = (color: string): string => {
    try {
        return toHex(color)
    } catch {
        return GORGIAS_CHAT_DEFAULT_COLOR
    }
}
