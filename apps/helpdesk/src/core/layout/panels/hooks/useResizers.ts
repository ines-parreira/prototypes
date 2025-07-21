import { useMemo } from 'react'
import type { MouseEvent } from 'react'

import shouldCreateResizer from '../helpers/shouldCreateResizer'
import type { PanelConfig } from '../types'

export default function useResizers(
    createResizer: (i: number) => (e: MouseEvent) => void,
    configs: Record<string, PanelConfig>,
    order: string[],
) {
    return useMemo(
        () =>
            order.reduce(
                (acc, name, i) => ({
                    ...acc,
                    [name]: shouldCreateResizer(i, configs, order)
                        ? createResizer(i)
                        : undefined,
                }),
                {} as Record<string, ((e: MouseEvent) => void) | undefined>,
            ),
        [createResizer, configs, order],
    )
}
