import type { ReactNode } from 'react'
import React from 'react'

import css from './CardHeaderTitle.less'

type Props = {
    children: ReactNode
}

export function CardHeaderTitle({ children }: Props) {
    return <span className={css.container}>{children}</span>
}
