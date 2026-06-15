import type { CSSProperties } from 'react'

import { Box, Loader } from '@gorgias/axiom'

const emptyPlaceholderStyle = {
    boxSizing: 'border-box',
} satisfies CSSProperties

export function TicketThreadEmptyPlaceholder() {
    return (
        <Box
            alignItems="center"
            justifyContent="center"
            h="100%"
            w="100%"
            py="xl"
            style={emptyPlaceholderStyle}
        >
            <Loader size="lg" aria-label="Loading ticket thread" />
        </Box>
    )
}
