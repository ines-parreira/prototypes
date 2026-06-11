import type { ReactNode } from 'react'

import { Box, Heading } from '@gorgias/axiom'

type SetupCardsProps = {
    inbound?: ReactNode
    outbound?: ReactNode
}

export function SetupCards({ inbound, outbound }: SetupCardsProps) {
    if (!inbound && !outbound) return null

    return (
        <Box flexDirection="column" gap="md" w="100%">
            <Heading size="md">Setup</Heading>
            {outbound}
            {inbound}
        </Box>
    )
}
