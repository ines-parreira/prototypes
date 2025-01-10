import type {Drag, PanelConfig} from '../types'

import clamp from './clamp'

export default function mutateSizes(
    configs: Record<string, PanelConfig>,
    order: string[],
    drag: Drag,
    delta: number
) {
    const {handle, sizes} = drag
    if (delta === 0) return sizes

    const left = order.slice(0, handle).reverse()
    const right = order.slice(handle)

    const grow = delta < 0 ? right : left
    const shrink = delta < 0 ? left : right

    const newSizes = {...sizes}

    const actualDelta = Math.min(
        Math.abs(delta),
        shrink.reduce((acc, n) => acc + (sizes[n] - configs[n].minSize), 0),
        grow.reduce((acc, n) => acc + (configs[n].maxSize - sizes[n]), 0)
    )

    let remainingDelta = actualDelta
    shrink.forEach((n) => {
        const {maxSize, minSize} = configs[n]
        newSizes[n] = clamp(sizes[n] - remainingDelta, minSize, maxSize)
        remainingDelta -= sizes[n] - newSizes[n]
    })

    remainingDelta = actualDelta
    grow.forEach((n) => {
        const {maxSize, minSize} = configs[n]
        newSizes[n] = clamp(sizes[n] + remainingDelta, minSize, maxSize)
        remainingDelta -= newSizes[n] - sizes[n]
    })

    return newSizes
}
