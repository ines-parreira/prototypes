import type { TableV1Meta } from '@gorgias/axiom'
import type { MetafieldType } from '@gorgias/helpdesk-types'

import type { SupportedCategories } from '../types'

export type Field = {
    id: string
    key: string
    name: string
    type: MetafieldType
    category: SupportedCategories
    isVisible?: boolean
}

export interface MetafieldsTableMeta extends TableV1Meta<Field> {
    onRemoveClick: (id: string) => void
    onVisibilityToggle: (id: string, isVisible: boolean) => void
}
