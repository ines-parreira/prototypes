import {Config} from 'panels'
import {PanelConfig} from 'panels/types'

const createConfig = (
    widths: number[],
    defaultConfig: Config
): PanelConfig[] => {
    return defaultConfig.map((config, i) => {
        const [defaultWidth, min, max] = config
        return [
            // check if it's the last panel
            defaultWidth === Infinity && i + 1 === defaultConfig.length
                ? defaultWidth
                : widths[i] || defaultWidth,
            min,
            max,
        ]
    })
}

export default createConfig
