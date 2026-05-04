import type { ReactNode } from 'react'

import { Text } from '@gorgias/axiom'

interface SubjectProps {
    children: ReactNode
}

export function Subject({ children }: SubjectProps) {
    return (
        <Text as="span" variant="bold" size="sm">
            {children}
        </Text>
    )
}
