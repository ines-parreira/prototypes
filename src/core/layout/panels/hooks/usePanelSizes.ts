import {useEffect, useRef, useState} from 'react'

import calculateSizes from '../helpers/calculateSizes'
import type {PanelConfig} from '../types'

export default function usePanelSizes(
    availableSize: number,
    configs: Record<string, PanelConfig>,
    order: string[]
) {
    const previousOrder = useRef<string[]>([])
    const state = useState<Record<string, number>>({})
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
            })
            previousOrder.current = order
            return newSizes
        })
    }, [availableSize, configs, order, setSizes])

    return state
}
