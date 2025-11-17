import type { TableMeta } from '@gorgias/axiom'

import type { MetafieldType } from '../MetafieldTypeItem/MetafieldTypeItem'

export type Field = {
    id: string
    name: string
    type: MetafieldType
    category: string
    isVisible?: boolean
}

export interface MetafieldsTableMeta extends TableMeta<Field> {
    onRemoveClick: (id: string) => void
    onVisibilityToggle: (id: string, isVisible: boolean) => void
}
