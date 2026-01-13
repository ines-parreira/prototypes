import { METAFIELD_CATEGORIES } from '../constants'
import type { SupportedCategories } from '../types'

export function getCategoryLabel(category?: SupportedCategories): string {
    const categoryDef = METAFIELD_CATEGORIES.find((c) => c.value === category)
    return categoryDef?.label ?? ''
}
