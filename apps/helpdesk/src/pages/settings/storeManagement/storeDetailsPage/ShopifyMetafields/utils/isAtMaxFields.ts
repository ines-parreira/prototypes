import { MAX_FIELDS_PER_CATEGORY } from '../constants'
import type { Field } from '../MetafieldsTable/types'
import type { MetafieldCategory } from '../types'

export const isAtMaxFields = (
    importedFields: Field[] | undefined,
    category: MetafieldCategory,
) =>
    (importedFields?.filter((field) => field.category === category) ?? [])
        .length >= MAX_FIELDS_PER_CATEGORY
