import type { TableMeta } from '@gorgias/axiom'

export type Field = {
    id: string
    name: string
    type: string
    category: string
    isVisible?: boolean
}

export interface MetafieldsTableMeta extends TableMeta<Field> {
    onRemoveClick: (id: string) => void
    onVisibilityToggle: (id: string, isVisible: boolean) => void
}
