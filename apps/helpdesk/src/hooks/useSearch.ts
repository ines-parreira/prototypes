import { useMemo } from 'react'

import { parse } from 'qs'
import { useLocation } from 'react-router-dom'

export function useSearch<T extends Record<string, unknown>>() {
    const { search } = useLocation()
    const parsedSearch = useMemo(
        () => parse(search, { ignoreQueryPrefix: true }),
        [search],
    )

    return parsedSearch as Partial<T>
}
