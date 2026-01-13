import type { SupportedCategories } from './types'

export type CategoryDefinition = {
    label: string
    value: SupportedCategories
}

export const METAFIELD_CATEGORIES: CategoryDefinition[] = [
    {
        label: 'Customer',
        value: 'Customer',
    },
    {
        label: 'Order',
        value: 'Order',
    },
    {
        label: 'Draft Order',
        value: 'DraftOrder',
    },
]

export const MAX_FIELDS_PER_CATEGORY = 10
