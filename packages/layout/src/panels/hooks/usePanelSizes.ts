import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import { calculateSizes } from '../helpers/calculateSizes'
import type { PanelConfig, Sizes } from '../types'

const getMissingDefaultSizes = (
    configs: Record<string, PanelConfig>,
    order: string[],
    savedSizes: Sizes,
) =>
    order.reduce((acc, name) => {
        const defaultSize = configs[name].defaultSize

        if (savedSizes[name] !== undefined || !Number.isFinite(defaultSize)) {
            return acc
        }

        return { ...acc, [name]: defaultSize }
    }, {} as Sizes)

export function usePanelSizes(
    availableSize: number,
    configs: Record<string, PanelConfig>,
    savedSizes: MutableRefObject<Sizes>,
    persistSizes: (sizes: Sizes) => void,
    order: string[],
) {
    const previousOrder = useRef<string[]>([])
    const state = useState<Sizes>({})
    const [, setSizes] = state

    useEffect(() => {
        if (!order.length) {
            setSizes({})
            return
        }

        const missingDefaultSizes = getMissingDefaultSizes(
            configs,
            order,
            savedSizes.current,
        )
        const effectiveSavedSizes = {
            ...savedSizes.current,
            ...missingDefaultSizes,
        }

        if (Object.keys(missingDefaultSizes).length) {
            persistSizes(missingDefaultSizes)
        }

        setSizes((currentSizes) => {
            const newSizes = calculateSizes({
                availableSize,
                configs,
                order,
                previousOrder: previousOrder.current,
                previousSizes: currentSizes,
                savedSizes: effectiveSavedSizes,
            })
            previousOrder.current = order
            return newSizes
        })
    }, [availableSize, configs, order, persistSizes, savedSizes, setSizes])

    return state
}
