import type { ReactNode } from 'react'

import css from './Excerpt.less'

type Props = {
    children: ReactNode
}

export function Excerpt({ children }: Props) {
    return <div className={css.excerpt}>{children}</div>
}
