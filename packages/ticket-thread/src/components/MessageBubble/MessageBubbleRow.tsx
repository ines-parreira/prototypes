import type { ReactNode } from 'react'

import css from './MessageBubble.less'

type Props = {
    children: ReactNode
}

export function MessageBubbleRow({ children }: Props) {
    return <div className={css.messageRow}>{children}</div>
}
