import type { ReactNode } from 'react'

import css from './Excerpt.less'

type Props = {
    children: ReactNode
}

export default function Excerpt({ children }: Props) {
    return <div className={css.excerpt}>{children}</div>
}
