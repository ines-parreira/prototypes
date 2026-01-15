import type { ReactNode } from 'react'

import cn from 'classnames'

import { usePanelGroup } from '../hooks/usePanelGroup'

import css from './PanelGroup.less'

type Props = {
    children: ReactNode
    className?: string
    subtractSize?: number
}

export function PanelGroup({ children, className, subtractSize }: Props) {
    usePanelGroup(subtractSize)
    return <div className={cn(css.panelGroup, className)}>{children}</div>
}
