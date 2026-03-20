import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

import { useSidebar } from '../../contexts/SidebarContext'

import css from './SidebarContent.less'

export type SidebarContentProps = {
    children: ReactNode
}

export function SidebarContent({ children }: SidebarContentProps) {
    const { isCollapsed } = useSidebar()

    return (
        <Box
            flex="1"
            flexDirection="column"
            pl="xs"
            pr="xs"
            gap="md"
            className={css.content}
            alignItems={isCollapsed ? 'center' : undefined}
        >
            {children}
        </Box>
    )
}
