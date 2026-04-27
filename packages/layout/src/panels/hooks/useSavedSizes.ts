import { useCallback, useMemo, useRef } from 'react'

import { useLocalStorage } from '@repo/hooks'

import type { Sizes } from '../types'

const KEY = 'panel-sizes'

function sanitiseSavedSizes(value: unknown): Sizes {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {}
    }

    return Object.entries(value)
        .filter(
            (entry): entry is [string, number] => typeof entry[1] === 'number',
        )
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {} as Sizes)
}

export function useSavedSizes() {
    const [storedSizes, setStoredSizes] = useLocalStorage<unknown>(KEY, {})
    const savedSizes = useRef<Sizes>(sanitiseSavedSizes(storedSizes))

    savedSizes.current = sanitiseSavedSizes(storedSizes)

    const persistSizes = useCallback(
        (sizes: Sizes) => {
            setStoredSizes((currentSizes: unknown) => {
                const nextSizes = {
                    ...sanitiseSavedSizes(currentSizes),
                    ...sizes,
                }
                savedSizes.current = nextSizes
                return nextSizes
            })
        },
        [setStoredSizes],
    )

    return useMemo(
        () => [savedSizes, persistSizes] as const,
        [persistSizes, savedSizes],
    )
}
