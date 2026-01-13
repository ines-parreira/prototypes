import type { MetafieldOwnerType } from '@gorgias/helpdesk-types'

export type SupportedCategories = Extract<
    MetafieldOwnerType,
    'Customer' | 'Order' | 'DraftOrder'
>
