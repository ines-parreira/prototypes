import type { ReactNode } from 'react'

import { Box, Separator } from '@gorgias/axiom'

export type SidebarFooterProps = {
    children: ReactNode
}

export function SidebarFooter({ children }: SidebarFooterProps) {
    return (
        <Box flexDirection="column" gap="md">
            <Separator />
            <Box
                justifyContent="space-between"
                ml="xxs"
                mr="xs"
                alignItems="center"
            >
                {children}
            </Box>
        </Box>
    )
}
