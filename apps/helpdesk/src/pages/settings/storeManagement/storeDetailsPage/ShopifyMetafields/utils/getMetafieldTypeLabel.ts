import type { MetafieldType } from '@gorgias/helpdesk-types'

import { typeConfig } from '../MetafieldTypeItem/MetafieldTypeItem'

export function getMetafieldTypeLabel(type: MetafieldType): string {
    return typeConfig[type]?.label || type
}
