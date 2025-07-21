import React, { ReactNode } from 'react'

import css from './PaywallViewChecklist.less'

type Props = {
    children: ReactNode
}

export default function PaywallViewChecklist({ children }: Props) {
    return <div className={css.container}>{children}</div>
}
