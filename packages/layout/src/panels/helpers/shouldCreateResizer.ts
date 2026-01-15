import type { PanelConfig } from '../types'

export function shouldCreateResizer(
    index: number,
    configs: Record<string, PanelConfig>,
    order: string[],
) {
    if (index === 0) return false

    return order
        .slice(0, index)
        .map((name) => configs[name])
        .some((config) => config.minSize < config.maxSize)
}
