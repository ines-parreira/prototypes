import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

export type SidebarProps = {
    children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
    return (
        <Box
            w="100%"
            h="100%"
            flexDirection="column"
            justifyContent="space-between"
            gap="md"
            pt="xs"
            pb="xs"
        >
            {children}
        </Box>
    )
}
