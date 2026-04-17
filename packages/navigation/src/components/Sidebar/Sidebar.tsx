import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

import { useSidebar } from '../../contexts/SidebarContext'

export type SidebarProps = {
    children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
    const { isCollapsed } = useSidebar()
    return (
        <Box
            w="100%"
            h="100%"
            flexDirection="column"
            justifyContent="space-between"
            gap={isCollapsed ? 'sm' : 'md'}
            pt="md"
            pb="xs"
        >
            {children}
        </Box>
    )
}
