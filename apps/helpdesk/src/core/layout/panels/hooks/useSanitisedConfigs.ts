import { useMemo } from 'react'

import sanitiseConfig from '../helpers/sanitiseConfig'
import type { PanelConfig } from '../types'

export default function useSanitisedConfigs(
    configs: Record<string, PanelConfig>,
    totalSize: number,
) {
    return useMemo(
        () =>
            Object.entries(configs).reduce(
                (acc, [name, config]) => ({
                    ...acc,
                    [name]: sanitiseConfig(config, totalSize),
                }),
                {} as typeof configs,
            ),
        [configs, totalSize],
    )
}
