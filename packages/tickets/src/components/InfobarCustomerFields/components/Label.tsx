import type { ReactNode } from 'react'

import { Text } from '@gorgias/axiom'

import css from './Label.less'

export const Label = ({ children }: { children: ReactNode }) => {
    return (
        <Text className={css.label} size="sm">
            {children}
        </Text>
    )
}
