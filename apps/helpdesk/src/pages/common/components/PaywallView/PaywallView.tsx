import type { ReactNode } from 'react'
import React from 'react'

import css from './PaywallView.less'

type Props = {
    children: ReactNode
}

export function PaywallView({ children }: Props) {
    return <div className={css.container}>{children}</div>
}
