import type { ReactNode } from 'react'

import { Box, Separator } from '@gorgias/axiom'

import { useSidebar } from '../../contexts/SidebarContext'

export type SidebarFooterProps = {
    children: ReactNode
}

export function SidebarFooter({ children }: SidebarFooterProps) {
    const { isCollapsed } = useSidebar()

    return (
        <Box flexDirection="column" gap="md">
            <Separator />
            <Box
                justifyContent="space-between"
                ml="xxs"
                mr="xs"
                flexDirection={isCollapsed ? 'column-reverse' : 'row'}
                alignItems="center"
                gap="md"
            >
                {children}
            </Box>
        </Box>
    )
}
