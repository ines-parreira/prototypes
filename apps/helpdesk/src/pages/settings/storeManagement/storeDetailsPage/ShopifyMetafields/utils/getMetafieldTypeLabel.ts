import type { MetafieldType } from '../MetafieldTypeItem/MetafieldTypeItem'
import { typeConfig } from '../MetafieldTypeItem/MetafieldTypeItem'

export function getMetafieldTypeLabel(type: MetafieldType): string {
    return typeConfig[type]?.label || type
}
