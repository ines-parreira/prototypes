import { useCallback, useMemo, useRef } from 'react'

import type { Sizes } from '../types'

const KEY = 'panel-sizes'

function getSavedSizes() {
    try {
        const raw = localStorage.getItem(KEY)
        if (raw === null) return {}

        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object') return {}

        return Object.entries(parsed)
            .filter(
                (entry): entry is [string, number] =>
                    typeof entry[1] === 'number',
            )
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Sizes)
    } catch {
        return {}
    }
}

export default function useSavedSizes() {
    const readDone = useRef(false)
    const savedSizes = useRef<Sizes>({})
    if (!readDone.current) {
        readDone.current = true
        savedSizes.current = getSavedSizes()
    }

    const persistSizes = useCallback((sizes: Sizes) => {
        savedSizes.current = { ...savedSizes.current, ...sizes }
        localStorage.setItem(KEY, JSON.stringify(savedSizes.current))
    }, [])

    return useMemo(
        () => [savedSizes, persistSizes] as const,
        [persistSizes, savedSizes],
    )
}
