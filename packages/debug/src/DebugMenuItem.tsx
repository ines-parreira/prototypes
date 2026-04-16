import type { ReactNode } from 'react'

import type { IconName } from '@gorgias/axiom'

export type DebugMenuItemProps = {
    id: string
    icon: IconName
    label: string
    children: ReactNode
}

export function DebugMenuItem(_props: DebugMenuItemProps) {
    return null
}
