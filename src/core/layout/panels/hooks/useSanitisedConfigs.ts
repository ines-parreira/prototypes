import {useMemo} from 'react'

import sanitiseConfig from '../helpers/sanitiseConfig'
import type {PanelConfig} from '../types'

export default function useSanitisedConfigs(
    configs: Record<string, PanelConfig>,
    savedSizes: Record<string, number>,
    totalSize: number
) {
    return useMemo(
        () =>
            Object.entries(configs).reduce(
                (acc, [name, config]) => ({
                    ...acc,
                    [name]: sanitiseConfig(config, savedSizes[name], totalSize),
                }),
                {} as typeof configs
            ),
        [configs, savedSizes, totalSize]
    )
}
