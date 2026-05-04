import type { ReactNode } from 'react'

import { Text } from '@gorgias/axiom'

import css from './Excerpt.less'

interface ExcerptProps {
    children: ReactNode
}

export function Excerpt({ children }: ExcerptProps) {
    return (
        <div className={css.excerpt}>
            <Text variant="regular" size="sm" color="content-neutral-tertiary">
                {children}
            </Text>
        </div>
    )
}
