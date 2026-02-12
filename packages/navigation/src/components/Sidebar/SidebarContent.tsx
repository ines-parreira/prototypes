import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

export type SidebarContentProps = {
    children: ReactNode
}

export function SidebarContent({ children }: SidebarContentProps) {
    return (
        <Box flex="1" flexDirection="column" gap="md">
            {children}
        </Box>
    )
}
