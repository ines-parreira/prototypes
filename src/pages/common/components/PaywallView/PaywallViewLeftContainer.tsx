import React, { ReactNode } from 'react'

import css from './PaywallViewLeftContainer.less'

type Props = {
    children: ReactNode
}

export default function PaywallViewLeftContainer({ children }: Props) {
    return <div className={css.container}>{children}</div>
}
