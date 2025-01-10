import {useCallback, useMemo, useRef} from 'react'

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
                    typeof entry[1] === 'number'
            )
            .reduce(
                (acc, [k, v]) => ({...acc, [k]: v}),
                {} as Record<string, number>
            )
    } catch (_err: unknown) {
        return {}
    }
}

export default function useSavedSizes() {
    const readDone = useRef(false)
    const savedSizes = useRef<Record<string, number>>({})
    if (!readDone.current) {
        readDone.current = true
        savedSizes.current = getSavedSizes()
    }

    const persistSizes = useCallback((sizes: Record<string, number>) => {
        const newSizes = {...savedSizes.current, ...sizes}
        localStorage.setItem(KEY, JSON.stringify(newSizes))
    }, [])

    return useMemo(
        () => [savedSizes.current, persistSizes] as const,
        [persistSizes]
    )
}
