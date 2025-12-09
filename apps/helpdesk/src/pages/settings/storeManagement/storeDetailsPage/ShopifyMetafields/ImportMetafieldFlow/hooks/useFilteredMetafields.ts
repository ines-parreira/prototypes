import { useMemo } from 'react'

import type { Field } from '../../MetafieldsTable/types'
import type { MetafieldCategory } from '../../types'

type UseFilteredMetafieldsParams = {
    data: Field[]
    category: MetafieldCategory
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
