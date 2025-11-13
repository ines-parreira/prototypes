import { METAFIELD_CATEGORIES } from '../constants'
import { MetafieldCategory } from '../types'

export function getCategoryLabel(category?: MetafieldCategory): string {
    const categoryDef = METAFIELD_CATEGORIES.find((c) => c.value === category)
    return categoryDef?.label ?? ''
}
