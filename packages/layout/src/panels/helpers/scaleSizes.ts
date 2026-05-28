import type { PanelConfig, Sizes } from '../types'
import { clamp } from './clamp'
import { sum } from './sum'

export type SizeSnapshot = {
    availableSize: number
    sizes: Sizes
}

type Options = {
    availableSize: number
    configs: Record<string, PanelConfig>
    order: string[]
    snapshot: SizeSnapshot
}

const RESIZE_DELTA_EPSILON = 0.001

const canAbsorbResizeRemainder = (config: PanelConfig) =>
    config.maxSize === Infinity

function getAdjustmentOrder(
    configs: Record<string, PanelConfig>,
    order: string[],
    shouldGrow: boolean,
) {
    const flexPanels = order.filter((name) =>
        canAbsorbResizeRemainder(configs[name]),
    )
    const remainingPanels = order.filter(
        (name) => !canAbsorbResizeRemainder(configs[name]),
    )
    const orderedPanels = [...flexPanels, ...remainingPanels]

    return shouldGrow ? orderedPanels : orderedPanels.reverse()
}

function applyRemainingSize(
    sizes: Sizes,
    configs: Record<string, PanelConfig>,
    order: string[],
    remainingSize: number,
) {
    const shouldGrow = remainingSize > 0
    const orderedNames = getAdjustmentOrder(configs, order, shouldGrow)
    let remaining = Math.abs(remainingSize)

    orderedNames.forEach((name) => {
        if (remaining <= RESIZE_DELTA_EPSILON) return

        const size = sizes[name]
        const capacity = shouldGrow
            ? configs[name].maxSize - size
            : size - configs[name].minSize
        const delta = Math.min(remaining, capacity)

        if (delta <= 0) return

        sizes[name] = shouldGrow ? size + delta : size - delta
        remaining -= delta
    })
}

export function scaleSizes({
    availableSize,
    configs,
    order,
    snapshot,
}: Options) {
    if (snapshot.availableSize <= 0) {
        return snapshot.sizes
    }

    const sizes = order.reduce((acc, name) => {
        const snapshotSize = snapshot.sizes[name] ?? configs[name].minSize
        const proportionalSize =
            (snapshotSize / snapshot.availableSize) * availableSize

        return {
            ...acc,
            [name]: clamp(
                proportionalSize,
                configs[name].minSize,
                configs[name].maxSize,
            ),
        }
    }, {} as Sizes)

    applyRemainingSize(
        sizes,
        configs,
        order,
        availableSize - sum(Object.values(sizes)),
    )

    return sizes
}
