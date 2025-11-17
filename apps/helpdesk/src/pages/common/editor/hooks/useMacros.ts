import { useCallback, useRef, useState } from 'react'

import type { MacrosProperties } from 'models/macro/types'

type Options = {
    initialFilters: MacrosProperties
}

export default function useMacros({ initialFilters }: Options) {
    const [filters, setFilters] = useState<MacrosProperties>(
        initialFilters || {},
    )
    const [query, setQuery] = useState('')
    const [isActive, setIsActive] = useState(false)
    const hasShown = useRef<boolean>(false)

    if (isActive && !hasShown.current) {
        hasShown.current = true
    }

    const handleChangeActive = useCallback((isActive?: boolean) => {
        setIsActive((s) => (typeof isActive === 'boolean' ? isActive : !s))
    }, [])

    const handleChangeFilters = useCallback(
        (changedFilters: MacrosProperties) => {
            setFilters((s) => ({ ...s, ...changedFilters }))
        },
        [],
    )

    return {
        filters,
        isActive,
        query,
        hasShown: hasShown.current,
        onChangeActive: handleChangeActive,
        onChangeFilters: handleChangeFilters,
        onChangeQuery: setQuery,
    }
}
