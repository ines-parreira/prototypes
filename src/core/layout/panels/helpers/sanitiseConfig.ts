import type {PanelConfig} from '../types'
import clamp from './clamp'

type ConfigKey = keyof PanelConfig

export default function sanitiseConfig(
    config: PanelConfig,
    savedSize: number | undefined,
    totalSize: number
) {
    const newConfig = {...config}
    if (savedSize) {
        newConfig.defaultSize = savedSize
    }

    Object.entries(newConfig).forEach(([k, v]) => {
        if (v > 0 && v < 1) {
            newConfig[k as keyof PanelConfig] = totalSize * v
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
        newConfig.maxSize
    )

    const isDirty = (Object.keys(config) as ConfigKey[]).some(
        (k) => config[k] !== newConfig[k]
    )
    return isDirty ? newConfig : config
}
