import React from 'react'
import type { ReactNode } from 'react'

import css from './Subject.less'

type Props = {
    children: ReactNode
}

export default function Subject({ children }: Props) {
    return <strong className={css.subject}>{children}</strong>
}
