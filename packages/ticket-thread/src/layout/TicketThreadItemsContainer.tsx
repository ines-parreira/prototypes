import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

type TicketThreadItemsContainerProps = {
    children?: ReactNode
}

export function TicketThreadItemsContainer({
    children,
}: TicketThreadItemsContainerProps) {
    return (
        <Box flexGrow={1} flexDirection="column" padding="md" gap="xs">
            {children}
        </Box>
    )
}
