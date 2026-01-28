import type { ReactNode } from 'react'

import { Box, Skeleton } from '@gorgias/axiom'

interface MetricCellProps {
    value: unknown
    children: ReactNode
}

export function MetricCell({ value, children }: MetricCellProps) {
    if (value === undefined) {
        return <Skeleton />
    }

    return <Box gap="xs">{children}</Box>
}
