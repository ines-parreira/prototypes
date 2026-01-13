import { useMemo } from 'react'

import type { Field } from '../../MetafieldsTable/types'
import type { SupportedCategories } from '../../types'

type UseFilteredMetafieldsParams = {
    data: Field[]
    category: SupportedCategories
}

export function useFilteredMetafields({
    data,
    category,
}: UseFilteredMetafieldsParams) {
    return useMemo(
        () => data.filter((field) => field.category === category),
        [data, category],
    )
}
