import type { ReactNode } from 'react'

import { Tooltip } from '@gorgias/axiom'
import type { TooltipProps } from '@gorgias/axiom'

import { useSidebar } from '../contexts/SidebarContext'

export type NavigationSidebarTooltipProps = {
    trigger: TooltipProps['trigger']
    children: ReactNode
    placement?: TooltipProps['placement']
}

export function NavigationSidebarTooltip({
    trigger,
    children,
    placement,
}: NavigationSidebarTooltipProps) {
    const { isCollapsed } = useSidebar()

    return (
        <Tooltip
            trigger={trigger}
            placement={isCollapsed ? 'right' : placement}
            delay={isCollapsed ? 300 : undefined}
        >
            {children}
        </Tooltip>
    )
}
