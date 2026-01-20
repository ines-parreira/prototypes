import type { MetafieldType } from '@gorgias/helpdesk-types'

import { TYPE_CONFIG } from '../constants'

export function getMetafieldTypeLabel(type: MetafieldType): string {
    return TYPE_CONFIG[type]?.label || type
}
