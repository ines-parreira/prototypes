import type { ReactNode } from 'react'

import type { IconName } from '@gorgias/axiom'

export type DebugMenuItemProps = {
    id: string
    icon: IconName
    label: string
    /**
     * Panel rendered when the item is selected. Required unless `onSelect` is
     * provided, in which case the item behaves as a one-shot action.
     */
    children?: ReactNode
    /**
     * Called when the item is selected. When set, no panel is rendered and the
     * `children` prop is ignored.
     */
    onSelect?: () => void
}

export function DebugMenuItem(_props: DebugMenuItemProps) {
    return null
}
