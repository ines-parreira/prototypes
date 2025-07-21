import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import calculateSizes from '../helpers/calculateSizes'
import type { PanelConfig, Sizes } from '../types'

export default function usePanelSizes(
    availableSize: number,
    configs: Record<string, PanelConfig>,
    savedSizes: MutableRefObject<Sizes>,
    order: string[],
) {
    const previousOrder = useRef<string[]>([])
    const state = useState<Sizes>({})
    const [, setSizes] = state

    useEffect(() => {
        setSizes((currentSizes) => {
            if (!order.length) return {}

            const newSizes = calculateSizes({
                availableSize,
                configs,
                order,
                previousOrder: previousOrder.current,
                previousSizes: currentSizes,
                savedSizes: savedSizes.current,
            })
            previousOrder.current = order
            return newSizes
        })
    }, [availableSize, configs, order, savedSizes, setSizes])

    return state
}
