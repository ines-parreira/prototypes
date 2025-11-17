import type { LeafType } from 'models/widget/types'

export type FieldEditFormData<T extends LeafType = LeafType> = {
    title: string
    type: T
}

export type HiddenFields = Array<keyof FieldEditFormData>
