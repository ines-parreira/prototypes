import type { PanelConfig } from '../types'
import { clamp } from './clamp'

type ConfigKey = keyof PanelConfig
type NumberKey = keyof Omit<PanelConfig, 'prioritise'>

export function sanitiseConfig(config: PanelConfig, totalSize: number) {
    const newConfig = { ...config }

    Object.entries(newConfig).forEach(([k, v]) => {
        if (typeof v === 'number' && v > 0 && v < 1) {
            newConfig[k as NumberKey] = totalSize * v
        }
    })

    if (newConfig.minSize < 0) {
        newConfig.minSize = 0
    }

    if (newConfig.maxSize < newConfig.minSize) {
        newConfig.maxSize = newConfig.minSize
    }

    newConfig.defaultSize = clamp(
        newConfig.defaultSize,
        newConfig.minSize,
        newConfig.maxSize,
    )

    const isDirty = (Object.keys(config) as ConfigKey[]).some(
        (k) => config[k] !== newConfig[k],
    )
    return isDirty ? newConfig : config
}
