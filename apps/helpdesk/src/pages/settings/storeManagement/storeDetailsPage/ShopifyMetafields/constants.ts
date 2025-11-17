import type { MetafieldCategory } from './types'

export type CategoryDefinition = {
    label: string
    value: MetafieldCategory
}

export const METAFIELD_CATEGORIES: CategoryDefinition[] = [
    {
        label: 'Customer',
        value: 'customer',
    },
    {
        label: 'Order',
        value: 'order',
    },
    {
        label: 'Draft Order',
        value: 'draft_order',
    },
]
