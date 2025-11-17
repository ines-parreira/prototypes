import type { ReactNode } from 'react'
import React from 'react'

import css from './PaywallViewActionButtons.less'

type Props = {
    children: ReactNode
}

export default function PaywallViewActionButtons({ children }: Props) {
    return <div className={css.container}>{children}</div>
}
