import type { ReactNode } from 'react'
import React from 'react'

import css from './CardHeaderSubtitle.less'

type Props = {
    children: ReactNode
}

export function CardHeaderSubtitle({ children }: Props) {
    return <span className={css.container}>{children}</span>
}
